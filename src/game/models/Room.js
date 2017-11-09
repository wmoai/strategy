const Immutable = require('immutable');
const Game = require('./Game.js');
const Player = require('./Player.js');
const Unit = require('./Unit.js');
const COM = require('./COM.js');

const STATE = Immutable.Map({
  ROOM: 10,
  SELECT: 20,
  BATTLE: 30,
});

module.exports = class Room extends Immutable.Record({
  id: null,
  isSolo: false,
  state: STATE.get('ROOM'),
  players: Immutable.Map(),
  game: null,
}) {

  toJS() {
    const json = super.toJS();
    json.players = this.players.map(player => player.toData()).toJS();
    return json;
  }

  static restore(data) {
    const room = new Room(data);
    return room.withMutations(mnt => {
      const players = {};
      Object.values(data.players).forEach(playerData => {
        const player = new Player(playerData);
        players[player.id] = player;
      });
      
      mnt.syncGame(data.game)
        .set('players', data.players
          ? Immutable.Map(players)
          : Immutable.Map()
        );
    });
  }

  static soloRoom(userId, deck) {
    const room = new Room({
      id: 1,
      isSolo: true,
    });
    const com = new COM();
    return room.withMutations(mnt => {
      mnt.join(userId, deck)
        .set('players', mnt.players.set(com.id, com))
        .ready(userId)
        .mightStartGame()
        .selectUnits(com.id, Object.keys(com.deck));
    });
  }

  syncGame(data) {
    return this.set('game', data ? Game.restore(data) : null);
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


  stateIs(str) {
    return this.state === STATE.get(str);
  }

  join(userId, deck) {
    const player = new Player({
      id: userId,
      deck: deck
    });
    return this.set('players', this.players.set(userId, player));
  }

  leave(userId) {
    return this.set('players', this.players.delete(userId));
  }

  player(userId) {
    const player = this.players.get(userId);
    if (!player) {
      throw `player[${userId}] is not exists.`;
    }
    return player;
  }

  opponent(userId) {
    let opponent;
    this.players.keySeq().forEach(key => {
      if (key !== userId) {
        opponent = this.player(key);
      }
    });
    return opponent;
  }

  isTrunPlayer(userId) {
    const player = this.player(userId);
    return this.game && player && player.offense == this.game.turn;
  }

  ready(userId) {
    const player = this.player(userId);
    return this.set(
      'players',
      this.players.set(userId, player.set('ready', true))
    );
  }

  mightStartGame() {
    if (
      this.state !== STATE.get('ROOM')
      || this.players.count() < 2
      || !this.players.reduce((pre, cur) => pre.ready && cur.ready)
    ) {
      return this;
    }
    let tgl = Math.random() >= 0.5;

    return this.withMutations(mnt => {
      mnt.set('game', (new Game()).setField(2))
        .set('players', mnt.players.map(player => {
          // decide offense side
          tgl = !tgl;
          return player.set('offense', tgl);
        }))
        .forwardState();
    });
  }

  selectUnits(userId, list) {
    // if (this.state !== STATE.get('SELECT')) {
      // return this;
    // }
    const player = this.player(userId);
    const units = list.map(index => Unit.create({
      offense: player.offense,
      unitId: player.deck[index],
    }));
    //FIXME Check cost and Reject

    return this.set('players', this.players.set(userId, player.set('selection', units)));
  }

  mightEngage() {
    const canEngage = this.players.reduce((pre, cur) => {
      return pre.selection && pre.selection.length > 0 && cur.selection && cur.selection.length > 0;
    });
    if (!canEngage) {
      return this;
    }
    const { field } = this.game;
    let units = [];
    this.players.forEach(player => {
      units = units.concat(
        player.selection.map((unit, seq) => {
          return unit.set('cellId', field.initialPos(player.offense)[seq]);
        })
      );
    });

    return this.withMutations(mnt => {
      mnt.set('game', mnt.game.initUnits(units))
        .forwardState();
    });
  }

  isTurnPlayer(userId) {
    const player = this.player(userId);
    return this.game && player && player.offense == this.game.turn;
  }

  actInGame(userId, from, to, target) {
    if (this.state !== STATE.get('BATTLE') || !this.isTurnPlayer(userId)) {
      return this;
    }

    return this.set('game', this.game.withMutations(mnt => {
      mnt.moveUnit(from, to)
        .actUnit(to, target)
        .mightChangeTurn()
        .mightEndGame();
    }));
  }

  endTurn(userId) {
    if (this.state !== STATE.get('BATTLE') || !this.isTurnPlayer(userId)) {
      return this;
    }
    return this.set('game', this.game.withMutations(mnt => {
      mnt.changeTurn()
        .mightEndGame();
    }));
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
