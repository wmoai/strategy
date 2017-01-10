const Map = require('./Map.js');

module.exports = class Game {
  constructor(gid) {
    this.gid = gid;
    this.turn = 0;
    this.phase = 0;
    this.size = 0;
    this.map = new Map();
  }

  data(isInit=false) {
    const data = {
      map: this.map.data(isInit),
      turn: this.turn,
      phase: this.phase,
      size: this.size
    };
    return data;
  }
  restore(data) {
    if (!data) {
      return;
    }
    this.map.restore(data.map);
    this.turn = data.turn || this.turn;
    this.phase = data.phase || this.phase;
    this.size = data.size || this.size;
  }

  isRun() {
    return this.turn > 0;
  }

  changePhase(pnum) {
    this.phase = pnum;
    if (this.phase == 1) {
      this.turn += 1;
    }
  }

};

