const Immutable = require('immutable');

const Player = require('../models/Player.js');
const Game = require('../models/Game.js');

const Unit = require('../models/Unit.js');

const STATE = Immutable.Map({
  ROOM: 10,
  SELECT: 20,
  BATTLE: 30,
  END: 40,
});

module.exports = class Match extends Immutable.Record({
  id: null,
  io: null,
  state: STATE.get('ROOM'),
  players: Immutable.Map([]),
  game: null,
}) {

  toJSON() {
    const json = super.toJSON();
    delete json.io;
    json.players = this.players.map(player => player.toData()).toJSON();
    return json;
  }

  forwardState() {
    let next = this.state;
    switch (this.state) {
      case STATE.get('ROOM'):
        next = STATE.get('SELECT');
        break;
      case STATE.get('SELECT'):
        next = STATE.get('BATTLE');
        break;
      case STATE.get('BATTLE'):
        next = STATE.get('ROOM');
        break;
    }
    return this.set('state', next);
  }

  player(socket) {
    return this.players.get(socket.userId);
  }

  opponent(id) {
    let opponent;
    this.players.keySeq().forEach(key => {
      if (key !== id) {
        opponent = this.players.get(key);
      }
    });
    return opponent;
  }

  getSockets() {
    return new Promise(resolve => {
      this.io.to(this.id).clients((err, sids) => {
        resolve(sids.map(sid => this.io.sockets[sid]));
      });
    });
  }

  join(userId, deck) {
    const player = new Player({
      id: userId,
      deck: deck
    });

    return this.withMutations(mnt => {
      mnt.set('players', mnt.players.set(userId, player))
        .mightNotifyMatched();
    });
  }

  broadcast(name, args={}) {
    this.io.to(this.id).emit(name, args);
  }

  leave(userId) {
    this.broadcast('unmatched');
    return this.set('players', this.players.delete(userId));
  }

  playerCount() {
    return this.players.count();
  }

  mightNotifyMatched() {
    if (this.state !== STATE.get('ROOM') || this.players.count() < 2) {
      return this;
    }
    this.broadcast('matched');
  }

  ready(socket) {
    const { userId } = socket;
    const player = this.players.get(userId);
    const match = this.set(
      'players',
      this.players.set(userId, player.set('ready', true))
    );

    return match.mightStartGame();
  }

  mightStartGame() {
    if (this.state !== STATE.get('ROOM') || this.players.count() < 2 || !this.players.reduce((pre, cur) => pre.ready && cur.ready)) {
      return this;
    }
    let tgl = Math.random() >= 0.5;

    const match = this.withMutations(mnt => {
      mnt.set('game', (new Game()).setField(2))
        .set('players', mnt.players.map(player => {
          // decide offense side
          tgl = !tgl;
          return player.set('offense', tgl);
        }))
        .forwardState();
    });
    match.getSockets().then(sockets => {
      sockets.forEach(socket => {
        socket.emit('startToSelectUnits', {
          you: match.player(socket),
          opponent: match.opponent(socket.userId)
        });
      });
    });
    return match;

  }

  selectUnits(socket, list) {
    if (this.state !== STATE.get('SELECT')) {
      return this;
    }
    const { userId, deck } = socket;
    const player = this.players.get(userId);
    const units = list.map(index => Unit.create({
      offense: player.offense,
      unitId: deck[index],
    }));
    //FIXME check cost and reject

    const match = this.set('players', this.players.set(userId, player.set('selection', units)));
    return match.mightEngage();
  }

  initUnits() {
    const { field } = this.game;

    let units = [];
    this.players.forEach(player => {
      units = units.concat(
        player.selection.map((unit, seq) => {
          return unit.set('cellId', field.initialPos(player.offense)[seq]);
        })
      );
    });
    return this.set('game', this.game.initUnits(units));
  }

  mightEngage() {
    const canEngage = this.players.reduce((pre, cur) => {
      return pre.selection && pre.selection.length > 0 && cur.selection && cur.selection.length > 0;
    });
    if (!canEngage) {
      return this;
    }

    const match = this.withMutations(mnt => {
      mnt.initUnits().forwardState();
    });
    match.broadcast('engage', {
      game: match.game.toData() 
    });
    return match;
  }

  isTurnPlayer(socket) {
    const player = this.player(socket);
    return this.game && player && player.offense == this.game.turn;
  }

  actInGame(socket, from, to, target) {
    if (this.state !== STATE.get('BATTLE')) {
      return this;
    }
    if (!this.isTurnPlayer(socket)) {
      console.error('action rejected');
      socket.emit('rejectAction');
      return this;
    }

    const match = this.withMutations(mnt => {
      mnt.set('game',
        mnt.game
        .moveUnit(from, to)
        .actUnit(to, target)
        .mightChangeTurn()
        .mightEndGame()
      ).mightResetPlayers();
    });
    match.broadcast('act', {
      move: { from: from, to: to },
      act: { to: target },
      game: match.game.toData() ,
    });

    return match;
  }

  endTurn(socket) {
    if (this.state !== STATE.get('BATTLE') || !this.isTurnPlayer(socket)) {
      return this;
    }
    const match = this.withMutations(mnt => {
      mnt.set('game', mnt.game.changeTurn().mightEndGame())
        .mightResetPlayers();
    });
    match.broadcast('changeTurn', {
      game: match.game.toData() 
    });

    return match;
  }

  mightResetPlayers() {
    if (!this.game.isEnd) {
      return this;
    }
    return this.withMutations(mnt => {
      mnt.set(
        'players',
        mnt.players.map(player => player.reset())
      ).forwardState();
    });
  }

};
