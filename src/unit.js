const State = {
  ready: Symbol(),
  acted: Symbol()
};

class Unit {
  constructor(y, x, player, symbol, stats) {
    this.y = y;
    this.x = x;
    this.player = player;
    this.symbol = symbol;
    this.foot = stats[0];
    this.range = stats[1];
    this.hp = this.maxHp = stats[2];
    this.pow = stats[3];
    this.dff = stats[4];
    this.spl = stats[5];
    this.healer = false;

    this.magical = false;
    this.state = State.ready;
  }

  getData() {
    return [
      this.y,  // 0
      this.x,
      this.player,
      this.symbol,
      this.foot,
      this.range,  // 5
      this.hp,
      this.maxHp,
      this.pow,
      this.dff,
      this.spl,  // 10
      this.healer,
      this.magical,
      this.isActed()
    ];
  }

  isPhase(player) {
    return this.player == player;
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

  getLandCost(land) {
    return land;
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

exports.Lord = class Lord extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '主', [4, [1], 40, 12, 3, 3]);
  }
};
exports.Archer = class Archer extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '弓', [4, [2], 36, 13, 2, 2]);
  }
};
exports.Armor = class Armor extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '重', [3, [1], 44, 15, 6, 0]);
  }
};
exports.Knight = class Knight extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '騎', [6, [1], 44, 14, 4, 2]);
  }
  getLandCost(land) {
    return Math.floor(super.getLandCost(land) * 1.5);
  }
};
exports.Magician = class Magician extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '魔', [4, [1,2], 30, 17, 1, 8]);
    this.magical = true;
  }
};
exports.Priest = class Priest extends Unit {
  constructor(y, x, player) {
    super(y, x, player, '僧', [3, [1], 26, 10, 0, 10]);
    this.healer = true;
  }
};
