const Room = require('../models/Room.js');
const Player = require('../models/Player.js');

module.exports = class GameServer {
  constructor() {
    this.rooms = new Map();
    this.io = null;
  }

  saveRoom(room) {
    this.rooms.set(room.id, room);
  }

  getRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      throw new Error(`Room${roomId} is not exists.`);
    }
    return this.rooms.get(roomId);
  }

  generateRoomId() {
    let id = '';
    do {
      const c = '0123456789';
      for(var i=0; i<5; i++){
        id += c[Math.floor(Math.random()*c.length)];
      }
    } while (this.rooms.has(id));
    return id;
  }

  listen(io) {
    this.io = io;
    io.on('connection', socket => {
      socket.emit('init', {
        userId: socket.userId,
        deck: socket.deck,
      });

      socket.on('createRoom', () => {
        const roomId = this.generateRoomId();
        this.saveRoom(new Room({ id: roomId }));
        this.join(roomId, socket);
      });

      socket.on('joinRoom', roomId => {
        this.join(roomId, socket);
      });

      socket.on('leaveRoom', roomId => {
        this.leave(roomId, socket);
      });

      socket.on('disconnect', () => {
      });
    });
  }

  syncRoom(room) {
    this.saveRoom(room);
    this.io.to(room.id).emit('syncRoom', room.toJSON());
  }

  syncGame(room) {
    this.saveRoom(room);
    this.io.to(room.id).emit('syncGame', room.game.toData());
  }

  join(roomId, socket) {
    const { userId, deck } = socket;
    try {
      let room = this.getRoom(roomId);
      socket.join(roomId);
      console.log(`join ${socket.userId} to room ${roomId}`);

      const player = new Player({
        id: userId,
        deck: deck
      });
      room = room.addPlayer(player);

      this.syncRoom(room);
    } catch (e) {
      return;
    }

    socket.on('readyToBattle', () => {
      let room = this.getRoom(roomId);
      this.syncRoom(room.readyToBattle(userId).mightStartGame());
    });
    socket.on('selectUnits', ({ list }) => {
      let room = this.getRoom(roomId);
      this.syncRoom(room.selectUnits(userId, list).mightEngage());
    });
    socket.on('act', ({ from, to, target }) => {
      let room = this.getRoom(roomId);
      this.syncGame(room.actInGame(userId, from, to, target).mightResetPlayers());
    });
    socket.on('endTurn', () => {
      let room = this.getRoom(roomId);
      this.syncGame(room.endTurn(userId).mightResetPlayers());
    });
  }

  leave(roomId, socket) {
    let room = this.getRoom(roomId);

    socket.removeAllListeners('readyToBattle');
    socket.removeAllListeners('selectUnits');
    socket.removeAllListeners('act');
    socket.removeAllListeners('endTurn');
    socket.leave(roomId);
    room = room.leave(socket.userId);
    if (room.players.count() == 0) {
      this.rooms.delete(roomId);
    } else {
      this.syncRoom(room);
    }
  }

};

