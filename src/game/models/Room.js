// @flow
import Game from './Game.js';
import Player from './Player.js';
import COM from './COM.js';

const STATE: Map<'ROOM'|'SELECT'|'BATTLE', number> = new Map([
  ['ROOM', 10],
  ['SELECT', 20],
  ['BATTLE', 30],
]);

export default class Room {
  id: string;
  isSolo: boolean;
  state: number;
  players: Map<string, Player>;
  game: ?Game;

  constructor(data?: {
    id?: string,
    isSolo?: boolean,
    state?: number,
    players?: Map<string, Player>,
    game?: Game,
  }) {
    this.isSolo = false;
    this.setState('ROOM');
    this.players = new Map();

    if (data) {
      if (data.id) this.id = data.id;
      if (data.isSolo) this.isSolo = data.isSolo;
      if (data.state) this.state = data.state;
      if (data.players) this.players = new Map(data.players);
      if (data.game) this.game = data.game;
    }
  }

  toData() {
    const { id, isSolo, state, players } = this;
    let game;
    if (this.game) {
      game = this.game.toData();
    }
    return { id, isSolo, state, players, game};
  }

  static restore(data: any) {
    const room = new Room(data);
    room.syncGame(data.game);
    return room;
  }

  static soloRoom(userId: string, deck: Array<number>) {
    const room = new Room({
      id: 'solo',
      isSolo: true,
    });
    const player = new Player({
      id: userId,
      deck: deck
    });
    const com = new COM();
    room.addPlayer(player);
    room.addPlayer(com);
    room.getBattleReady(userId);
    room.mightStartGame();
    room.selectUnits(com.id, Array.from(com.deck.keys()));
    return room;
  }

  syncGame(data: any) {
    if (!data) {
      return this;
    }
    this.game = new Game(data);
    return this;
  }

  setState(str: 'ROOM'|'SELECT'|'BATTLE') {
    const newState = STATE.get(str);
    if (newState != null) {
      this.state = newState;
    }
    return this;
  }

  stateIs(str: 'ROOM'|'SELECT'|'BATTLE') {
    return this.state === STATE.get(str);
  }

  addPlayer(player: Player) {
    this.players.set(player.id, player);
    return this;
  }

  leave(userId: string) {
    this.players.delete(userId);
    return this;
  }

  player(userId: string): ?Player {
    const player = this.players.get(userId);
    return player;
  }

  opponent(userId: string) {
    let opponent;
    for (let key of this.players.keys()) {
      if (key !== userId) {
        opponent = this.player(key);
      }
    }
    return opponent;
  }

  isTurnPlayer(userId: string) {
    const player = this.player(userId);
    return this.game && player && player.isOffense == this.game.state.turn;
  }

  getBattleReady(userId: string) {
    const player = this.player(userId);
    if (player) {
      player.isReady = true;
      this.players.set(userId, player);
    }
    return this;
  }

  mightStartGame() {
    let isReady = true;
    for (let player of this.players.values()) {
      isReady = isReady && player.isReady;
    }
    if (
      this.state !== STATE.get('ROOM')
      || this.players.size < 2
      || !isReady
    ) {
      return this;
    }
    let tgl = Math.random() >= 0.5;

    this.game = new Game();
    this.players = new Map(Array.from(this.players.values()).map(player => {
      // decide offense side
      tgl = !tgl;
      player.isOffense = tgl;
      return [player.id, player];
    }));
    this.setState('SELECT');
    return this;
  }

  selectUnits(userId: string, list: Array<number>) {
    const player = this.player(userId);
    if (!player) {
      return this;
    }
    const units = list.map(index => {
      return {
        isOffense: player.isOffense,
        unitId: player.deck[index],
      };
    });
    //FIXME Check cost and Reject

    player.selection = units;
    this.players.set(userId, player);
    return this;
  }

  mightEngage() {
    let canEngage = true;
    for (let player of this.players.values()) {
      canEngage = canEngage && (player.selection && player.selection.length > 0);
    }
    const { game } = this;
    if (!canEngage || !game) {
      return this;
    }
    const { field } = game;
    let units: Array<{ isOffense: boolean, unitId: number }> = [];
    for (let player of this.players.values()) {
      units = units.concat(
        player.selection.map((unit, seq) => {
          return {
            ...unit,
            state: {
              cellId: field.initialPos(player.isOffense)[seq]
            },
          };
        })
      );
    }

    game.initUnits(units);
    this.setState('BATTLE');
    return this;
  }

  canAct(userId: string) {
    return this.state === STATE.get('BATTLE') && this.isTurnPlayer(userId);
  }

  actInGame(userId: string, from: number, to: number, target: number) {
    const { game } = this;
    if (game && this.canAct(userId)) {
      return game.fixAction(from, to, target);
    }
  }

  endTurn(userId: string) {
    const { game } = this;
    if (game && this.canAct(userId)) {
      game.changeTurn();
    }
    return this;
  }

  mightResetPlayers() {
    const { game } = this;
    if (!game) {
      return this;
    }
    if (!game.state.isEnd && this.players.length >= 2) {
      return this;
    }

    this.players = new Map(Array.from(this.players.values()).map(player => {
      player.reset();
      return [player.id, player];
    }));
    this.setState('ROOM');
    return this;
  }

}
