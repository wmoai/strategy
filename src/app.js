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
const redis = require('redis');
const rediscl = redis.createClient();

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

const GameServer = require('./game/Server.js');

app.get('/', (req, res) => {
  res.render('index');
});
app.post('/matching', (req, res) => {
  req.session.reload(() => {
    req.session.userId = uid(24);
    res.render('matching');
  });
});

app.get('/game/:id', (req, res, next) => {
  const gid = req.params.id;
  const gserver = new GameServer(rediscl);
  gserver.existsGame(gid, isExists => {
    if (!isExists) {
      return next(new Error('game not found'));
    }
    res.render('game', {gid: gid});
  });
});
app.get('/game/:id/stat', (req, res) => {
  res.send('data');
});

app.use((req, res, next) => {
  next(new Error('not found'));
});
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(next, err.message);
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
        return next();
      } else {
        next('fail', false);
      }
    });
  } else {
    next('fail', false);
  }
};

const matchingNS = io.of('/matching');
matchingNS.use(handshake);
matchingNS.on('connection', socket => {
  rediscl.rpop('matching', (err, socketId) => {
    if (socketId) {
      const wait = matchingNS.connected[socketId];
      if (wait) {
        const gameId = uid(24);
        const gserver = new GameServer(rediscl);
        gserver.init(gameId, wait.userId, socket.userId);
        [socket, wait].forEach(socket => {
          socket.emit('done', gameId);
        });
      }
    }
    rediscl.lpush('matching', socket.id);
  });
});


const gameNS = io.of('/game');
gameNS.use(handshake);
gameNS.on('connection', socket => {
  socket.on('join', gid => {
    const gserver = new GameServer(rediscl);
    console.log('create');
    gserver.get(gid, (err, game, player) => {
      if (err || !game) {
        return;
      }
      const userId = socket.userId;
      socket.emit('mirror', game.data(true));
      socket.join(gid);

      if (!player.isPlayer(userId)) {
        return;
      }
      socket.emit('pnum', player.pnum(userId));

      if (!game.isRun()) {
        gserver.isPrepared(gid, userId, (isPrepared) => {
          if (!isPrepared) {
            socket.emit('preparation', {
              klassList: gserver.klassList()
            });
            socket.on('prepared', klassIds => {
              gserver.saveSortie(gid, userId, klassIds, () => {
                gserver.engage(gid, (game) => {
                  if (game) {
                    gameNS.to(gid).emit('mirror', game.data());
                  }
                });
              });
            });
          }
        });
      }
      socket.on('action', (fromCid, toCid, targetCid) => {
        gserver.action(gid, userId, fromCid, toCid, targetCid, (game) => {
          gameNS.to(gid).emit('completeAction', game.data());
          const winnedPnum = gserver.winnedPnum(game);
          if (winnedPnum !== undefined) {
            gameNS.to(gid).emit('winner', winnedPnum);
          }
        });
      });

    });

  });
});
