const express = require('express');
const Path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const uid = require('uid-safe').sync;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

app.set('view engine', 'pug');
app.set('views', Path.join(__dirname, '../views'));
app.use(express.static(Path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// const GameServer = require('./game/server/Server.js');
// const gameServer = new GameServer();
const RoomServer = require('./RoomServer.js');
const roomServer = new RoomServer();
const resource = require('./game/data').init();

// app.get('/', (req, res) => {
  // res.render('index', {
    // units: req.cookies.deck ? (
      // req.cookies.deck.map(unitId => {
        // return resource.unit[unitId];
      // })
    // ) : null
  // });
// });

// function getUnits(deck) {
  // return deck ? (
    // deck.map(unitId => {
      // return resource.unit[unitId];
    // })
  // ) : null;
// }

// app.get('/deck', (req, res) => {
  // jwt.verify(req.cookies.jwt, JWT_SECRET, (err, data) => {
    // res.send({
      // units: getUnits(data.deck)
    // });
  // });
// });

app.get('/user', (req, res) => {
  jwt.verify(req.cookies.jwt, JWT_SECRET, (err, data) => {
    res.send({
      id: data.userId,
      deck: data.deck
    });
  });
});

app.post('/deck', (req, res) => {
  const common = Object.values(resource.unit).filter(unit => unit.cost == 2);
  const elite = Object.values(resource.unit).filter(unit => unit.cost == 3);
  const epic = Object.values(resource.unit).filter(unit => unit.cost == 5);
  const deck = [].concat(
    sealPack(common, 6),
    sealPack(elite, 4),
    sealPack(epic, 2)
  );
  // res.cookie('deck', deck);
  res.cookie('jwt', jwt.sign({
    userId: uid(24),
    deck: deck
  }, JWT_SECRET));

  res.send({
    // units: getUnits(deck)
    deck
  });
});


function sealPack(units, count) {
  const indexes = [];
  while(indexes.length < count) {
    const sel = Math.floor(Math.random() * units.length);
    if (!indexes.includes(sel)) {
      indexes.push(sel);
    }
  }
  return indexes.map(index => {
    return units[index].id;
  });
}

  /*
app.post('/sealed', (req, res) => {
  const common = Object.values(resource.unit).filter(unit => unit.cost == 2);
  const elite = Object.values(resource.unit).filter(unit => unit.cost == 3);
  const epic = Object.values(resource.unit).filter(unit => unit.cost == 5);
  const deck = [].concat(
    sealPack(common, 6),
    sealPack(elite, 4),
    sealPack(epic, 2)
  );

  res.cookie('deck', deck);
  res.redirect('/');
});

app.get('/units/:unitId', (req, res) => {
  console.log(req.params.unitId);
  res.render('index', {
    units: req.cookies.deck ? (
      req.cookies.deck.map(unitId => {
        return resource.unit[unitId];
      })
    ) : null
  });
});

app.post('/app', (req, res) => {
  res.cookie('jwt', jwt.sign({
    userId: uid(24),
    deck: req.cookies.deck
  }, JWT_SECRET));
  res.render('app');
});

app.get('/deck.json', (req, res) => {
  if (!req.cookies.deck) {
    return res.status(404).send('deck not found');
  }
  res.send(req.cookies.deck.map(unitId => {
    return resource.unit[unitId];
  }));
});
*/

app.get('/*', (req, res) => {
  res.render('index2');
});

// app.use((req, res, next) => {
  // next(new Error('not found'));
// });
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  // console.log(next, err.message);
});


const server = require('http').createServer(app);
server.listen(process.env.PORT || 3005);

const io = require('socket.io').listen(server);
/*
const gameNS = io.of('/game');
gameNS.use((socket, next) => {
  const cookie = require('cookie').parse(socket.request.headers.cookie);
  jwt.verify(cookie.jwt, JWT_SECRET, (err, data) => {
    if (err) {
      return next('fail', false);
    }
    console.log('user', data.userId);
    socket.userId = data.userId;
    socket.deck = data.deck;
    return next();
  });
});
gameServer.listen(gameNS);
*/
roomServer.listen(io);

