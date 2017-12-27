const Immutable = require('immutable');
import Game from './Game.js';
const Player = require('./Player.js');
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

  toData() {
    const json = super.toJSON();
    if (this.game) {
      json.game = this.game.toData();
    }
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
    const player = new Player({
      id: userId,
      deck: deck
    });
    const com = new COM();
    return room.withMutations(mnt => {
      mnt.addPlayer(player)
        .addPlayer(com)
        .getBattleReady(userId)
        .mightStartGame()
        .selectUnits(com.id, Object.keys(com.deck));
    });
  }

  syncGame(data) {
    if (!data) {
      return this;
    }
    // return this.set('game', data ? Game.restore(data) : null);
    return this.set('game', new Game(data));
  }

  setState(str) {
    return this.set('state', STATE.get(str));
  }

  stateIs(str) {
    return this.state === STATE.get(str);
  }

  addPlayer(player) {
    return this.set('players', this.players.set(player.id, player));
  }

  leave(userId) {
    return this.set('players', this.players.delete(userId));
  }

  player(userId) {
    const player = this.players.get(userId);
    // if (!player) {
      // throw `player[${userId}] is not exists.`;
    // }
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

  isTurnPlayer(userId) {
    const player = this.player(userId);
    return this.game && player && player.isOffense == this.game.getState().turn;
  }

  getBattleReady(userId) {
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
      // mnt.set('game', (new Game()).setField())
      mnt.set('game', new Game())
        .set('players', mnt.players.map(player => {
          // decide offense side
          tgl = !tgl;
          return player.set('isOffense', tgl);
        }))
        .setState('SELECT');
    });
  }

  selectUnits(userId, list) {
    const player = this.player(userId);
    // const units = list.map(index => createUnit({
      // isOffense: player.isOffense,
      // unitId: player.deck[index],
    // }));
    const units = list.map(index => {
      return {
        isOffense: player.isOffense,
        unitId: player.deck[index],
      };
    });
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
          // unit.setCellId(field.initialPos(player.isOffense)[seq]);
          // return unit;
          return {
            ...unit,
            state: {
              cellId: field.initialPos(player.isOffense)[seq]
            },
          };
        })
      );
    });

    this.game.initUnits(units);
    return this.setState('BATTLE');
  }

  canAct(userId) {
    return this.state === STATE.get('BATTLE') && this.isTurnPlayer(userId);
  }

  actInGame(userId, from, to, target) {
    if (this.canAct(userId)) {
      this.game.fixAction(from, to, target);
    }
    return this;
  }

  endTurn(userId) {
    if (this.canAct(userId)) {
      this.game.changeTurn();
    }
    return this;
  }

  mightResetPlayers() {
    if (!this.game.isEnd) {
      return this;
    }
    return this.withMutations(mnt => {
      mnt.set(
        'players',
        mnt.players.map(player => player.reset())
      ).setState('ROOM');
    });
  }


};
