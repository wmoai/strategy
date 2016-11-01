const Path = require('path');
const Hapi = require('hapi');
const vision = require('vision');
const jade = require('jade');
const inert = require('inert');
const SocketIO = require('socket.io');

const server = new Hapi.Server();
server.connection({
  port: 3004,
  routes: {
    files: {
      relativeTo: Path.join(__dirname, '../public')
    }
  }
});

server.register(vision, () => {
  server.views({
    engines: {jade: jade},
    path: Path.join(__dirname, '../views'),
    compileOptions: {
      pretty: true
    }
  });
});

server.register(inert, () => {
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        index: true
      }
    }
  });
});


const Game = require('./game.js');
const Unit = require('./unit.js');
const land = [
  [1,1,1,1,1,1,1,1,9,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,2,2,3,3,1,1,9,9,1,1,1,1,1,1],
  [1,1,1,3,3,3,1,9,9,9,9,1,1,1,1,1],
  [1,1,1,1,1,1,1,9,9,9,9,1,1,1,1,1],
  [1,1,1,1,3,3,1,9,9,9,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,9,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
const units = [
  new Unit.Lord(3, 3, 1),
  new Unit.Knight(3, 2, 1),
  new Unit.Priest(4, 2, 1),
  new Unit.Archer(4, 3, 1),
  new Unit.Armor(3, 4, 1),
  new Unit.Magician(4, 4, 1),
  new Unit.Knight(8, 13, 2),
  new Unit.Knight(8, 12, 2),
  new Unit.Knight(8, 11, 2),
  new Unit.Knight(8, 10, 2),
  new Unit.Knight(8, 9, 2),
  new Unit.Knight(8, 8, 2)
];
const game = new Game(land, units);

server.route([
  {
    method: 'GET',
    path: '/',
    config: {
      handler: function(request, reply) {
        return reply.view('index');
      }
    }
  },
  {
    method: 'GET',
    path: '/init',
    config: {
      handler: function(request, reply) {
        return reply({
          mw: game.mapWidth,
          field: game.land,
          units: game.getUnitData(),
          playerNum: 0,
          phase: game.phase
        });
      }
    }
  }
]);


let player = {};
const io = SocketIO(server.listener);
io.on('connection', socket => {
  socket.emit('init', {
    mw: game.mapWidth,
    field: game.land,
    units: game.getUnitData(),
    playerNum: 0,
    phase: game.phase
  });

  socket.on('engage', () => {
    let playerNum = 0;
    if (socket == player[1] || socket == player[2]) {
      return;
    }
    if (!player[1]) {
      player[1] = socket;
      playerNum = 1;
    } else if (!player[2]) {
      player[2] = socket;
      playerNum = 2;
    }
    socket.emit('pnum', {
      playerNum: playerNum
    });
  });
  socket.on('leave', () => {
    if (socket == player[1]) {
      player[1] = null;
    } else if (socket == player[2]) {
      player[2] = null;
    }
    socket.emit('pnum', {
      playerNum: 0
    });
  });

  socket.on('control', data => {
    if (player[game.phase] != socket) {
      return;
    }
    game.selectCell(data[0], data[1]);
    io.sockets.emit('update', {
      units: game.getUnitData(),
      mask: game.getMaskData(),
      phase: game.phase
    });
  });
  socket.on('disconnect', () => {
    if (socket == player[1]) {
      player[1] = null;
    } else if (socket == player[2]) {
      player[2] = null;
    }
  });
});

server.start(err => {
  if (err) {
    throw err;
  }
  console.log(`server running at: ${server.info.uri}`);
});
