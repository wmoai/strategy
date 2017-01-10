const fieldArr = [
  [1,1,2,2,3,3,3,3,9,2,3,3,3,2,2,2],
  [1,1,1,1,1,1,1,1,1,1,1,3,3,3,2,2],
  [1,1,1,1,1,1,9,9,9,9,1,1,3,3,3,2],
  [2,2,1,1,1,2,1,9,9,9,9,1,1,3,3,2],
  [2,2,2,2,2,2,2,1,9,9,9,9,1,2,3,3],
  [1,1,1,2,2,2,2,2,9,9,9,9,1,2,3,3],
  [1,1,1,1,2,2,2,2,1,9,9,9,1,2,3,2],
  [1,1,1,1,1,2,3,2,1,9,9,9,1,2,2,2],
  [1,1,1,1,1,2,3,3,1,1,9,1,1,2,2,1],
  [1,1,1,1,1,2,3,3,1,1,1,1,2,2,1,1],
  [1,1,1,1,2,2,3,3,1,1,1,1,2,1,1,1],
  [1,1,2,2,2,3,3,1,1,1,1,2,1,1,1,1],
  [2,2,2,2,3,3,1,1,1,1,1,1,1,1,1,1],
  [2,2,3,3,3,1,1,1,1,1,1,1,1,1,1,1],
  [3,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1]
];
const fwidth = fieldArr[0].length;
const initPos = [
  [
    [2,1],[2,2],[2,3],[2,4],
    [3,1],[3,2],[3,3],[3,4]
  ],
  [
    [1,1],[10,11],[10,12],[10,13],
    [11,10],[11,11],[11,12],[11,13]
  ]
];

const Unit = require('./Unit.js');

module.exports = class Field {
  constructor() {
    this.array = fieldArr;
    this.width = fwidth;
    this.height = fieldArr.length;
    this.initPos = initPos;
    this.units = {};
  }
  data() {
    return {
      width: this.width,
      height: this.height,
      array: this.array
    };
  }
  cellId(y, x) {
    return y * this.width + x;
  }
  existsCell(y, x) {
    return (
      y >= 0
      && y < this.height
      && x >= 0
      && x < this.width
    );
  }
  landCost(y, x) {
    if (!this.existsCell(y, x)) {
      return null;
    }
    return this.array[y][x];
  }
  unit(cellId) {
    return this.units[cellId];
  }
  distance(cid1, cid2) {
    const y1 = Math.floor(cid1 / this.width);
    const x1 = Math.floor(cid1 % this.width);
    const y2 = Math.floor(cid2 / this.width);
    const x2 = Math.floor(cid2 % this.width);
    return Math.abs(Math.abs(y1 - y2) + Math.abs(x1 - x2));
  }

  setUnits(pnum, klassIds) {
    klassIds.forEach((klassId, i) => {
      const pos = this.initPos[pnum][i];
      const posId = this.cellId(pos[0], pos[1]);
      this.units[posId] = Unit.createByIndex(pnum, klassId);
    });
  }

  isMovable(pnum, fromCid, toCid) {
    if (fromCid == toCid) {
      return true;
    }
    const unit = this.unit(fromCid);
    if (!unit || unit.acted || unit.pnum != pnum || this.unit(toCid)) {
      console.log('ho');
      return false;
    }
    let movable = false;

    const search4 = (y, x, stamina, init) => {
      if (!this.existsCell(y, x) || movable) {
        return;
      }
      const ccid = this.cellId(y, x);
      const cost = this.landCost(y, x);
      const tunit = this.unit(ccid);
      if (tunit && tunit.pnum != pnum) {
        return;
      }
      if (!init) {
        stamina -= unit.klass.landCost(cost);
      }
      if (stamina >= 0) {
        if (!movable[ccid] || stamina > movable[ccid]) {
          movable = (toCid == ccid);
          search4(y-1, x, stamina);
          search4(y+1, x, stamina);
          search4(y, x-1, stamina);
          search4(y, x+1, stamina);
        }
      }
    };
    const y = Math.floor(fromCid / this.width);
    const x = Math.floor(fromCid % this.width);
    search4(y, x, unit.klass.move, true);
    return movable;
  }

  isActionable(unit, fromCid, toCid) {
    const target = this.unit(toCid);
    if (!unit || unit.acted || unit.hp <= 0 || !target || target.hp <= 0) {
      return false;
    }
    if (unit.klass.healer) {
      if (unit.pnum != target.pnum) {
        return false;
      }
    } else {
      if (unit.pnum == target.pnum) {
        return false;
      }
    }

    let actionable = false;
    const dist = this.distance(fromCid, toCid);
    unit.klass.range.forEach(range=> {
      if (range == dist) {
        actionable = true;
      }
    });
    return actionable;
  }

  validateAction(pnum, fromCid, toCid, targetCid) {
    if (!this.isMovable(pnum, fromCid, toCid)) {
      return false;
    }
    if (targetCid && !this.isActionable(this.unit(fromCid), toCid, targetCid)) {
      return false;
    }
    return true;
  }

  moveUnit(fromCid, toCid) {
    this.units[toCid] = this.units[fromCid];
    if (toCid != fromCid) {
      delete this.units[fromCid];
    }
  }

  actUnit(fromCid, toCid) {
    const unit = this.unit(fromCid);
    if (unit) {
      unit.acted = 1;
    }
    if (!toCid) {
      return;
    }
    const target = this.unit(toCid);

    unit.act(target);
    if (!unit.klass.healer && !target.klass.healer && this.isActionable(target, toCid, fromCid)) {
      target.act(unit);
    }
    if (unit.hp <= 0) {
      delete this.units[fromCid];
    }
    if (target.hp <= 0) {
      delete this.units[toCid];
    }
  }

  isEndPhase(pnum) {
    let ended = true;
    Object.keys(this.units).forEach(key => {
      const unit = this.units[key];
      if (pnum == unit.pnum) {
        ended = unit.acted && ended;
      }
    });
    return ended;
  }

  resetUnitsActed() {
    Object.keys(this.units).forEach(key => {
      const unit = this.units[key];
      unit.acted = 0;
    });
  }

  remainUnitPnums() {
    const result = [];
    Object.keys(this.units).forEach(key => {
      const unit = this.units[key];
      if (result.indexOf(unit.pnum) == -1) {
        result.push(unit.pnum);
      }
    });
    return result;
  }

};


