const Match = require('./Match.js');

module.exports = class GameServer {
  constructor() {
    this.matches = new Map();
  }

  initSocket(io) {
    io.on('connection', socket => {

      socket.on('createRoom', () => {
        const matchId = this.createMatchId();
        this.matches.set(matchId, new Match({
          id: matchId,
          io: io
        }));
        this.join(matchId, socket);
      });

      socket.on('joinRoom', matchId => {
        this.join(matchId, socket);
      });

      socket.on('leaveRoom', matchId => {
        let match = this.matches.get(matchId);
        if (!match) {
          return;
        }
        socket.leave(matchId);
        match = match.leave(socket.userId);
        if (match.playerCount() == 0) {
          this.matches.delete(matchId);
        } else {
          this.matches.set(matchId, match);
        }
      });

      socket.on('disconnect', () => {
      });
    });
  }

  createMatchId() {
    let matchId = '';
    const c = '0123456789';
    for(var i=0; i<5; i++){
      matchId += c[Math.floor(Math.random()*c.length)];
    }
    return matchId;
  }

  join(matchId, socket) {
    const match = this.matches.get(matchId);
    if (!match) {
      return;
    }
    socket.join(matchId);
    console.log(`join ${socket.userId} to room ${matchId}`);
    socket.emit('enterRoom', {
      roomId: matchId,
    });
    this.matches.set(matchId, match.join(socket.userId, socket.deck));

    socket.on('selectUnits', ({ list }) => {
      const match = this.matches.get(matchId);
      this.matches.set(matchId, match.selectUnits(socket, list));
    });
    socket.on('lineup', ({ list }) => {
      const match = this.matches.get(matchId);
      this.matches.set(matchId, match.lineup(socket, list));
    });
    socket.on('act', ({ from, to, target }) => {
      const match = this.matches.get(matchId);
      this.matches.set(matchId, match.actInGame(socket, from, to, target));
    });
    socket.on('endTurn', () => {
      const match = this.matches.get(matchId);
      this.matches.set(matchId, match.endTurn(socket));
    });
  }

};
