const express = require('express');
const Path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisStore = new RedisStore({});
const app = express();
const SECRET = 'your secret';
const uid = require('uid-safe').sync;
const redis = require('./redis.js');

app.set('view engine', 'pug');
app.set('views', Path.join(__dirname, '../views'));
app.use(express.static(Path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  store: redisStore,
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
  }
}));

const MatchServer = require('./game/server/MatchServer.js');
const matchServer = new MatchServer();

app.get('/', (req, res) => {
  res.render('index', {
    units: require('./game/data/json/unit.json')
  });
});
app.post('/matching', (req, res) => {
  req.session.reload(() => {
    req.session.userId = uid(24);
    req.session.deck = req.body.deck;
    res.render('matching');
  });
});

app.get('/game/:id', (req, res, next) => {
  const mid = req.params.id;
  if (!matchServer.existsMatch(mid)) {
    return next(new Error('game not found'));
  }
  res.render('game', {mid: mid});
});
app.get('/game/:id/stat', (req, res) => {
  res.send('data');
});

app.use((req, res, next) => {
  next(new Error('not found'));
});
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  // console.log(next, err.message);
});


const server = require('http').createServer(app);
server.listen(3005);

const io = require('socket.io').listen(server);
const handshake = function(socket, next) {
  const cookie = require('cookie').parse(socket.request.headers.cookie);
  const sid = require('cookie-parser').signedCookie(cookie['connect.sid'], SECRET);
  if (sid) {
    redisStore.get(sid, (err, sess) => {
      if (!err && sess && sess.userId) {
        socket.userId = sess.userId;
        socket.deck = sess.deck;
        return next();
      } else {
        next('fail', false);
      }
    });
  } else {
    next('fail', false);
  }
};

const matchmaker = require('./matchmaker.js');

const matchingNS = io.of('/matching');
matchingNS.use(handshake);
matchingNS.on('connection', socket => {
  matchmaker.wait(socket.id);
  socket.on('disconnect', () => {
    matchmaker.remove(socket.id);
  });
});

const bredis = redis.duplicate();
function makeMatch() {
  bredis.brpop('matching', 0, (err, replies) => {
    const ids = JSON.parse(replies[1]);
    //TODO heart beat & retry
    const match = matchServer.createMatch();
    ids.forEach(socketId => {
      const socket = matchingNS.connected[socketId];
      match.player.add(socket.userId, socket.deck);
      socket.emit('done', match.id);
    });

    makeMatch();
  });
}
makeMatch();


const gameNS = io.of('/game');
gameNS.use(handshake);
gameNS.on('connection', socket => {
  socket.on('join', matchId => {
    const match = matchServer.getMatch(matchId);
    if (!match) {
      return;
    }
    socket.join(matchId);
    const userId = socket.userId;
    socket.emit('metaData', match.metaData(userId));
    socket.emit('mirror', match.game.data());

    if (!match.player.isPlayer(userId)) {
      return;
    }

    if (!match.player.isReady(userId)) {
      socket.emit('preparation');
      socket.on('prepared', selectedIndexes => {
        match.player.setSortie(userId, selectedIndexes);
        if (match.engage()) {
          gameNS.to(matchId).emit('mirror', match.game.data());
        }
      });
    }

    socket.on('action', (fromCid, toCid, targetCid) => {
      if (match.action(userId, fromCid, toCid, targetCid)) {
        gameNS.to(matchId).emit('completeAction', match.game.data());
        const winnedPnum = match.winnedPnum(match.game);
        if (winnedPnum !== undefined) {
          gameNS.to(matchId).emit('winner', winnedPnum);
        }
      }
    });

  });
});

