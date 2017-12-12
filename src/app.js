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

const RoomServer = require('./RoomServer.js');
const roomServer = new RoomServer();
const resource = require('./game/data');

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
  res.cookie('jwt', jwt.sign({
    userId: uid(24),
    deck
  }, JWT_SECRET));

  res.send({ deck });
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

app.get('/*', (req, res) => {
  res.render('index2');
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  // console.log(next, err.message);
});


const server = require('http').createServer(app);
server.listen(process.env.PORT || 3005);

const io = require('socket.io').listen(server);
roomServer.listen(io);

