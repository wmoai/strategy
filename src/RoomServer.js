const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const Room = require('./game/models/Room.js');
const Player = require('./game/models/Player.js');

module.exports = class RoomServer {

  constructor() {
    this.rooms = new Map(); // { id: room }
    this.userToRoom = new Map(); // { userId: roomId }
    this.io = null;
  }

  listen(io) {
    const namespace = io.of('/game');
    this.io = namespace;
    namespace.on('connection', socket => {

      // sync session from jwt cookie and setup socket
      const cookies = cookie.parse(socket.request.headers.cookie);
      jwt.verify(cookies.jwt, JWT_SECRET, (err, data) => {
        if (err) {
          socket.disconnect();
          return;
        }

        const { userId, deck } = data;

        socket.on('createRoom', () => {
          const roomId = this.generateRoomId();
          const room = new Room({ id: roomId });
          this.rooms.set(room.id, room);
          this.userToRoom.set(userId, room.id);
          this.join(roomId, userId, deck, socket);
        });

        socket.on('joinRoom', roomId => {
          this.userToRoom.set(userId, roomId);
          this.join(roomId, userId, deck, socket);
        });

        socket.on('leaveRoom', () => {
          socket.disconnect();
        });

        socket.on('disconnect', () => {
          this.leave(userId);
          console.log('disconnected');
        });
      });

      // socket.emit('init', {
        // userId: socket.userId,
        // deck: socket.deck,
      // });

      // socket.on('createRoom', () => {
        // const roomId = this.generateRoomId();
        // this.saveRoom(new Room({ id: roomId }));
        // this.join(roomId, socket);
      // });

      // socket.on('joinRoom', roomId => {
        // this.join(roomId, socket);
      // });

      // socket.on('leaveRoom', roomId => {
        // this.leave(roomId, socket);
      // });

      // socket.on('disconnect', () => {
        // console.log('disconnected');
      // });
    });

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

  // createRoom(userId) {
    // const roomId = this.generateRoomId();
    // const room = new Room({ id: roomId });
    // this.rooms.set(room.id, room);
    // this.userToRoom.set(userId, room.id);
  // }

  getRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      throw new Error(`Room[${roomId}] is not exists.`);
    }
    return this.rooms.get(roomId);
  }

  // enterRoom(userId, room) {
    // this.saveRoom(room);
    // this.io.to(room.id).emit('initRoom', {
      // userId,
      // room: room.toJSON()
    // });
  // }

  syncRoom(room) {
    this.saveRoom(room);
    this.io.to(room.id).emit('syncRoom', room.toJSON());
  }

  syncGame(room, action=null) {
    this.saveRoom(room);
    this.io.to(room.id).emit('syncGame', {
      game: room.game.toData(),
      action,
    });
    this.io.to(room.id).emit('syncUnits', {
      units: room.game.units.map(unit => {
        return {
          seq: unit.seq,
          hp: unit.hp,
          cellId: unit.cellId,
          acted: unit.acted,
        };
      }).toArray(),
    });
  }

  saveRoom(room) {
    this.rooms.set(room.id, room);
  }

  join(roomId, userId, deck, socket) {
    try {
      let room = this.getRoom(roomId);
      socket.join(roomId);
      console.log(`join ${userId} to room ${roomId}`);

      const player = new Player({
        id: userId,
        deck: deck
      });
      room = room.addPlayer(player);
      socket.emit('enterRoom', { userId });
      this.syncRoom(room);

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
        this.syncGame(
          room.actInGame(userId, from, to, target).mightResetPlayers(),
          { from, to, target }
        );
      });
      socket.on('endTurn', () => {
        let room = this.getRoom(roomId);
        this.syncGame(room.endTurn(userId).mightResetPlayers());
      });

    } catch (e) {
      socket.disconnect();
      return;
    }
  }

  leave(userId) {
    if (!userId) {
      return;
    }
    const roomId = this.userToRoom.get(userId);
    try {
      let room = this.getRoom(roomId);
      room = room.leave(userId);
      if (room.players.count() == 0) {
        this.rooms.delete(roomId);
      } else {
        this.syncRoom(room);
      }
    } catch (e) {
      return;
    }
    this.userToRoom.delete(userId);
  }

};
