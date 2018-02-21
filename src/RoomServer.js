// @flow

import cookie from 'cookie';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

import Room from './game/models/Room.js';
import Player from './game/models/Player.js';

export default class RoomServer {
  rooms: Map<string, Room>;
  userToRoom: Map<string, string>;
  io: any;

  constructor() {
    this.rooms = new Map();
    this.userToRoom = new Map();
  }

  listen(io: any) {
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

        socket.on('createRoom', (callback) => {
          const roomId = this.generateRoomId();
          const room = new Room({ id: roomId });
          this.rooms.set(room.id, room);
          this.userToRoom.set(userId, room.id);
          this.join(roomId, userId, deck, socket);
          callback();
        });

        socket.on('joinRoom', (roomId, callback) => {
          this.userToRoom.set(userId, roomId);
          this.join(roomId, userId, deck, socket);
          callback();
        });

        socket.on('leaveRoom', () => {
          socket.disconnect();
        });

        socket.on('disconnect', () => {
          this.leave(userId);
          console.log('disconnected');
        });
      });

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

  getRoom(roomId: string) {
    if (!this.rooms.has(roomId)) {
      throw new Error(`Room[${roomId}] is not exists.`);
    }
    return this.rooms.get(roomId);
  }

  syncRoom(room: Room) {
    this.saveRoom(room);
    this.io.to(room.id).emit('syncRoom', room.toData());
  }

  syncGame(room: Room, action?: { from:number, to:number, target:?number }) {
    this.saveRoom(room);
    const { game } = room;
    if (game) {
      this.io.to(room.id).emit('syncGame', {
        game: game.toData(),
        action,
      });
    }
  }

  saveRoom(room: Room) {
    this.rooms.set(room.id, room);
  }

  join(roomId: string, userId: string, deck: Array<number>, socket: any) {
    try {
      let room = this.getRoom(roomId);
      if (!room) {
        throw `room ${roomId} is not exists.`;
      }
      socket.join(roomId);
      console.log(`join ${userId} to room ${roomId}`);

      const player = new Player({
        id: userId,
        deck: deck
      });
      room.addPlayer(player);
      socket.emit('enterRoom', { userId });
      this.syncRoom(room);

      socket.on('getBattleReady', () => {
        let room = this.getRoom(roomId);
        if (room) {
          this.syncRoom(room.getBattleReady(userId).mightStartGame());
        }
      });
      socket.on('selectUnits', ({ list }) => {
        let room = this.getRoom(roomId);
        if (room) {
          this.syncRoom(room.selectUnits(userId, list).mightEngage());
        }
      });
      socket.on('syncGame', () => {
        let room = this.getRoom(roomId);
        if (room) {
          const { game } = room;
          if (game) {
            socket.emit('syncGame', {
              game: game.toData(),
            });
          }
        }
      });
      socket.on('act', ({ from, to, target }) => {
        let room = this.getRoom(roomId);
        if (room) {
          const changes = room.actInGame(userId, from, to, target);
          room.mightResetPlayers();
          this.syncGame(
            room,
            { from, to, target, changes }
          );
        }
      });
      socket.on('endTurn', () => {
        let room = this.getRoom(roomId);
        if (room) {
          this.syncGame(room.endTurn(userId).mightResetPlayers());
        }
      });
      socket.on('returnRoom', () => {
        let room = this.getRoom(roomId);
        if (room) {
          socket.emit('syncRoom', room.toData());
        }
      });
    } catch (e) {
      console.log(e);
      socket.disconnect();
    }
  }

  leave(userId: string) {
    if (!userId) {
      return;
    }
    const roomId = this.userToRoom.get(userId);
    if (!roomId) {
      return;
    }
    let room = this.getRoom(roomId);
    if (!room) {
      return;
    }
    room.leave(userId);
    if (room.players.size == 0) {
      this.rooms.delete(roomId);
    } else {
      this.syncRoom(room);
    }
    this.userToRoom.delete(userId);
  }

}
