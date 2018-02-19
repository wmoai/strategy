const express = require('express');
const Path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const app = express();
const uid = require('uid-safe').sync;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

app.set('view engine', 'pug');
app.set('views', Path.join(__dirname, '../views'));
app.use(compression());
app.use(express.static(Path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

import RoomServer from './RoomServer.js';
const roomServer = new RoomServer();
import unitData from './game/data/unitData.js';

app.get('/user', (req, res) => {
  jwt.verify(req.cookies.jwt, JWT_SECRET, (err, data) => {
    if (err || !data) {
      const { id, deck } = createUser(res); 
      res.send({
        id,
        deck,
      });
      return;
    }
    res.send({
      id: data.userId,
      deck: data.deck
    });
  });
});

app.post('/deck', (req, res) => {
  const { deck } = createUser(res); 
  res.send({ deck });
});

function createUser(res) {
  const units = Array.from(unitData.values());
  const common = Object.values(units).filter(unit => unit.cost == 3);
  const elite = Object.values(units).filter(unit => unit.cost == 4);
  const epic = Object.values(units).filter(unit => unit.cost == 5);
  const deck = [].concat(
    sealPack(common, 3),
    sealPack(elite, 6),
    sealPack(epic, 3)
  );
  const userId = uid(24);
  res.cookie('jwt', jwt.sign({
    userId,
    deck
  }, JWT_SECRET));
  return {
    id: userId,
    deck
  };
}

function sealPack(units, count) {
  const indexes = [];
  while(indexes.length < count) {
    const rand = Math.random();
    const sel = Math.floor(rand * units.length);
    indexes.push(sel);
  }
  return indexes.map(index => {
    return units[index].id;
  });
}

app.get('/*', (req, res) => {
  res.render('index2');
});

app.use((err, req, res, next) => { // eslint-disable-line
  res.status(500).send(err.message);
});


const server = require('http').createServer(app);
server.listen(process.env.PORT || 3005);

const io = require('socket.io').listen(server);
roomServer.listen(io);

