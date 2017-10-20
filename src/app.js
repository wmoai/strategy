const express = require('express');
const Path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const uid = require('uid-safe').sync;
const jwt = require('jsonwebtoken');
const config = require('../config/secret.json');
const JWT_SECRET = config.jwtSecret;

app.set('view engine', 'pug');
app.set('views', Path.join(__dirname, '../views'));
app.use(express.static(Path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const GameServer = require('./game/server/Server.js');
const gameServer = new GameServer();
const Data = require('./game/data');

app.get('/', (req, res) => {
  res.render('index', {
    units: req.cookies.sealed ? (
      req.cookies.sealed.map(unitId => {
        return Data.unitStatus(unitId);
      })
    ) : []
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

app.post('/sealed', (req, res) => {
  const common = Data.units().filter(unit => unit.cost == 2);
  const elite = Data.units().filter(unit => unit.cost == 3);
  const epic = Data.units().filter(unit => unit.cost == 5);
  const deck = [].concat(
    sealPack(common, 6),
    sealPack(elite, 4),
    sealPack(epic, 2)
  );

  res.cookie('sealed', deck);
  res.redirect('/');
});

app.post('/app', (req, res) => {
  res.cookie('jwt', jwt.sign({
    userId: uid(24),
    // deck: Array.prototype.concat([], req.body.deck)
    deck: req.cookies.sealed
  }, JWT_SECRET));
  res.render('app');
});
app.get('/test', (req, res) => {
  res.render('test');
});

app.get('/game/:id', (req, res, next) => {
  const mid = req.params.id;
  if (!gameServer.existsMatch(mid)) {
    return next(new Error('game not found'));
  }
  res.render('game', {mid: mid});
});
app.get('/game/:id/stat', (req, res) => {
  res.send('data');
});
app.get('/favicon.ico', function(req, res) {
  res.sendState(204);
});

app.use((req, res, next) => {
  next(new Error('not found'));
});
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  // console.log(next, err.message);
});


const server = require('http').createServer(app);
Data.init().then(() => {
  // server.listen(3005);
  server.listen(80);
});

const io = require('socket.io').listen(server);
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
gameServer.initSocket(gameNS);

