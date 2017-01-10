const Info = require('./Info.js');
const Field = require('./Field.js');

const games = {};
class Game {
  constructor(gid, pid1, pid2) {
    this.gid = gid;
    this.info = new Info(pid1, pid2);
    this.field = new Field();
    this.klass = require('./klass.json');
    this.winned = null;
  }

  staticData(pid) {
    return {
      pnum: this.info.pnum(pid),
      field: this.field.data(),
      klasses: this.klass,
      size: 7
    };
  }

  data() {
    const units = {};
    if (this.info.state.is('RUN')) {
      Object.keys(this.field.units).forEach(key => {
        units[key] = this.field.units[key].data();
      });
    }
    return {
      state: this.info.state,
      units: units,
      phase: this.info.phase,
      turn: this.info.turn,
      winned: this.winned
    };
  }

  initUnits(pid, klassIds, engage) {
    if (!this.info.isPlayer(pid)) {
      return;
    }
    const pnum = this.info.pnum(pid);
    this.field.setUnits(pnum, klassIds);
    this.info.prepare(pid);
    if (this.info.state.is('RUN')) {
      if (engage) engage();
    }
  }

  action(pid, fromCid, moveCid, targetCid) {
    if (this.info.state.is('RUN') && this.info.isPhaser(pid)) {
      const pnum = this.info.pnum(pid);
      if (this.field.validateAction(pnum, fromCid, moveCid, targetCid)) {
        this.field.moveUnit(fromCid, moveCid);
        this.field.actUnit(moveCid, targetCid);
        this.checkEnd();
        if (this.field.isEndPhase(pnum)) {
          this.field.resetUnitsActed();
          this.info.changePhase();
        }
      }
    }
  }

  checkEnd() {
    const remainPnums = this.field.remainUnitPnums();
    if (remainPnums.length == 1) {
      this.winned = remainPnums[0];
    }
  }

}

exports.get = function(gid) {
  return games[gid];
};
exports.create = function(gid, pid1, pid2) {
  games[gid] = new Game(gid, pid1, pid2);
};
