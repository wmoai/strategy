const State = {
  ready: Symbol(),
  acted: Symbol()
}

class Unit {
  constructor(y, x, player, symbol, stats) {
    this.y = y;
    this.x = x;
    this.player = player;
    this.symbol = symbol;
    this.foot = stats[0];
    this.range = stats[1];
    this.hp = this.maxHp = stats[2];
    this.atk = stats[3];
    this.mgc = stats[4];
    this.dff = stats[5];
    this.spl = stats[6];
    this.magical = false;
    this.healer = false;

    this.state = State.ready;
  }

  isPhase(player) {
    return this.player == player
  }
  isReady() {
    return (this.state == State.ready);
  }
  isActed() {
    return (this.state == State.acted);
  }
  resetState() {
    this.state = State.ready;
  }

  explore(land) {

  }

  move(y, x) {
    this.py = this.y;
    this.px = this.x;
    this.y = y;
    this.x = x;
  }

  cancelMove() {
    this.y = this.py;
    this.x = this.px;
    this.state = State.ready;
  }

  standby() {
    this.state = State.acted;
  }
}

export class Lord extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '主', [4, [1], 40, 12, 0, 3, 3]);
  }
}
export class Archer extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '弓', [4, [2], 36, 13, 0, 2, 2]);
  }
}
export class Armor extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '重', [3, [1], 44, 15, 0, 8, 0]);
  }
}
export class Knight extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '騎', [6, [1], 44, 14, 0, 4, 2]);
  }
}
export class Magician extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '魔', [4, [1,2], 32, 0, 17, 1, 9]);
    this.magical = true;
  }
}
export class Priest extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '僧', [3, [1], 26, 0, 10, 0, 10]);
    this.healer = true;
  }
}

