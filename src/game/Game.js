const Immutable = require('immutable');
const Map = require('./Map.js');

module.exports = class Game extends Immutable.Record({
  turn: 0,
  phase: 0,
  map: new Map()
}) {

  data(isInit=false) {
    const data = {
      map: this.map.data(isInit),
      turn: this.turn,
      phase: this.phase
    };
    return data;
  }

  static restore(data) {
    if (!data) {
      return new Game();
    }
    data.map = Map.restore(data.map);
    return new Game(data);
  }

  start(pnum) {
    return this.withMutations(mnt => {
      mnt.set('turn', 1)
      .set('phase', pnum);
    });
  }

  isRun() {
    return this.turn > 0;
  }

  changePhase(pnum) {
    return this.withMutations(mnt => {
      mnt.set('phase', pnum);
      if (pnum == 1) {
        mnt.set('turn', mnt.turn + 1);
      }
    });
  }

  putUnit(cellId, unit) {
    return this.set('map', this.map.putUnit(cellId, unit));
  }

  moveUnit(fromCid, toCid) {
    return this.set('map', this.map.moveUnit(fromCid, toCid));
  }

  actUnit(fromCid, toCid) {
    return this.set('map', this.map.actUnit(fromCid, toCid));
  }

};

