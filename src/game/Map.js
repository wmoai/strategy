const Unit = require('./Unit.js');
const Field = require('./Field.js');

module.exports = class Map {
  constructor() {
    this.field = null;
    this.units = {};
  }

  setField(obj) {
    this.field = new Field(obj);
  }

  data(hasField=false) {
    const unitsData = {};
    Object.keys(this.units).forEach(key => {
      unitsData[key] = this.units[key].data();
    });
    const data = {
      units: unitsData
    };
    if (hasField) {
      data.field = this.field.data();
    }
    return data;
  }
  restore(data) {
    if (!data) {
      return;
    }
    this.units = {};
    if (data.units) {
      Object.keys(data.units).forEach(key => {
        this.units[key] = Unit.parse(data.units[key]);
      });
    }
    if (data.field) {
      this.field = new Field(data.field);
    }
  }

  putUnit(cellId, unit) {
    this.units[cellId] = unit;
  }

  unit(cellId) {
    return this.units[cellId];
  }

  movingMap(cellId, noMove=false) {
    const unit = this.units[cellId];
    const movable = {};
    const actionable = {};

    const search4 = (y, x, stamina, init) => {
      if (!this.field.existsCell(y, x)) {
        return;
      }
      const ccid = this.field.cellId(y, x);
      const cost = this.field.cost(ccid);
      const eunit = this.units[ccid];
      if (eunit && unit.pnum != eunit.pnum) {
        return;
      }
      if (!init) {
        stamina -= unit.klass.takenFoot(cost);
      }
      if (stamina >= 0) {
        if (!movable[ccid] || stamina > movable[ccid]) {
          movable[ccid] = stamina;
          for (let range=unit.klass.min_range; range<=unit.klass.max_range; range++) {
            const bd = 90 / range;
            for(let i=0; i<360; i+=bd) {
              const ay = y + (range * Math.sin(i * (Math.PI / 180)) | 0);
              const ax = x + (range * Math.cos(i * (Math.PI / 180)) | 0);
              const acid = this.field.cellId(ay, ax);
              if (this.field.existsCell(ay, ax)) {
                actionable[acid] = true;
              }
            }
          }
          search4(y-1, x, stamina);
          search4(y+1, x, stamina);
          search4(y, x-1, stamina);
          search4(y, x+1, stamina);
        }
      }
    };
    const [y, x] = this.field.coordinates(cellId);
    let move = unit.klass.move;
    if (noMove) {
      move = 0;
    }
    search4(y, x, move, true);
    return {
      movable: movable,
      actionable: actionable
    };
  }

  isMovable(fromCid, toCid) {
    if (fromCid == toCid) {
      return true;
    }
    const unit = this.units[fromCid];
    if (!unit || this.units[toCid]) {
      return false;
    }
    let movable = false;

    const search4 = (y, x, stamina, init) => {
      if (!this.field.existsCell(y, x) || movable) {
        return;
      }
      const ccid = this.field.cellId(y, x);
      const cost = this.field.cost(ccid);
      const eunit = this.units[ccid];
      if (eunit && unit.pnum != eunit.pnum) {
        return;
      }
      if (!init) {
        stamina -= unit.klass.takenFoot(cost);
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
    const [y, x] = this.field.coordinates(fromCid);
    search4(y, x, unit.klass.move, true);
    return movable;
  }

  moveUnit(fromCid, toCid) {
    if (!this.isMovable(fromCid, toCid)) {
      return false;
    }
    this.units[toCid] = this.units[fromCid];
    if (toCid != fromCid) {
      delete this.units[fromCid];
    }
    return true;
  }

  isActionable(unit, fromCid, toCid) {
    const target = this.units[toCid];
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
    const dist = this.field.distance(fromCid, toCid);
    actionable = (unit.klass.min_range <= dist && dist <= unit.klass.max_range);
    return actionable;
  }

  actUnit(fromCid, toCid) {
    const unit = this.units[fromCid];
    if (unit) {
      unit.acted = 1;
    }
    if (!toCid) {
      return;
    }
    const target = this.units[toCid];

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
      unit.acted = false;
    });
  }

  survivedCount() {
    let result = {};
    Object.keys(this.units).forEach(key => {
      const unit = this.units[key];
      if (result[unit.pnum] == undefined) {
        result[unit.pnum] = 0;
      }
      result[unit.pnum] += 1;
    });
    return result;
  }

};
