const Room = require('../models/Room.js');

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
        userId: socket.userId
      });

      socket.on('soloPlay', () => {

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

  updateRoom(room) {
    this.saveRoom(room);
    this.io.to(room.id).emit('syncRoom', room.toJSON());
  }

  updateGame(room) {
    this.saveRoom(room);
    this.io.to(room.id).emit('syncGame', room.game.toData());
  }

  join(roomId, socket) {
    let room = this.getRoom(roomId);
    socket.join(roomId);
    console.log(`join ${socket.userId} to room ${roomId}`);

    const { userId, deck } = socket;
    room = room.join(userId, deck);
    this.updateRoom(room);

    socket.on('ready', () => {
      let room = this.getRoom(roomId);
      this.updateRoom(room.ready(userId).mightStartGame());
    });
    socket.on('selectUnits', ({ list }) => {
      let room = this.getRoom(roomId);
      this.updateRoom(room.selectUnits(userId, list).mightEngage());
    });
    socket.on('act', ({ from, to, target }) => {
      let room = this.getRoom(roomId);
      this.updateGame(room.actInGame(userId, from, to, target));
    });
    socket.on('endTurn', () => {
      let room = this.getRoom(roomId);
      this.updateGame(room.endTurn(userId));
    });
  }

  soloPlay(roomId, socket) {
    let room = this.getRoom(roomId);

    const { userId, deck } = socket;
    room = room.join(userId, deck);
    this.updateRoom(room);

    socket.on('ready', () => {
      let room = this.getRoom(roomId);
      this.updateRoom(room.ready(userId).mightStartGame());
    });
    socket.on('selectUnits', ({ list }) => {
      let room = this.getRoom(roomId);
      this.updateRoom(room.selectUnits(userId, list).mightEngage());
    });
    socket.on('act', ({ from, to, target }) => {
      let room = this.getRoom(roomId);
      this.updateGame(room.actInGame(userId, from, to, target));
    });
    socket.on('endTurn', () => {
      let room = this.getRoom(roomId);
      this.updateGame(room.endTurn(userId));
    });
  }

  leave(roomId, socket) {
    let room = this.getRoom(roomId);

    socket.removeAllListeners('ready');
    socket.removeAllListeners('selectUnits');
    socket.removeAllListeners('act');
    socket.removeAllListeners('endTurn');
    socket.leave(roomId);
    room = room.leave(socket.userId);
    if (room.players.count() == 0) {
      this.rooms.delete(roomId);
    } else {
      this.updateRoom(room);
    }
  }

};


