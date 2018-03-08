const express = require('express');
const Path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const app = express();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

import * as user from './routes/user.js';

app.set('view engine', 'pug');
app.set('views', Path.join(__dirname, '../views'));
app.use(compression());
app.use(express.static(Path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  jwt.verify(req.cookies.jwt, JWT_SECRET, (err, data) => {
    req.jwt = (err || !data) ? user.create(req, res) : data;
    next();
  });
});


app.get('/user', user.get);
app.post('/deck', user.setDeck);

app.get('/*', (req, res) => {
  res.render('index');
});

app.use((err, req, res, next) => { // eslint-disable-line
  res.status(500).send(err.message);
});


const server = require('http').createServer(app);
server.listen(process.env.PORT || 3005);

import RoomServer from './RoomServer.js';
const roomServer = new RoomServer();
const io = require('socket.io').listen(server);
roomServer.listen(io);

