const Immutable = require('immutable');

const Unit = require('./Unit.js');
const Field = require('./Field.js').setup(require('./data/json/geo.json'));
const map1 = require('./data/json/field/seki.json');

module.exports = class Map extends Immutable.Record({
  field: new Field(map1),
  units: Immutable.Map({})
}) {

  data() {
    const unitsData = {};
    this.units.keySeq().forEach(key => {
      unitsData[key] = this.units.get(key).data();
    });
    const data = {
      units: unitsData
    };
    return data;
  }

  static restore(data) {
    const map = new Map();

    // if (data.field) {
      // map.field = new Field(data.field);
    // }
    return map.set('units', map.units.withMutations(mnt => {
      if (data && data.units) {
        Object.keys(data.units).forEach(key => {
          mnt.set(Number(key), Unit.parse(data.units[key]));
        });
      }
    }));
  }

  // setField(obj) {
    // this.field = new Field(obj);
  // }

  putUnit(cellId, unit) {
    return this.set('units', this.units.set(cellId, unit));
  }

  unit(cellId) {
    return this.units.get(cellId);
  }

  movingMap(cellId, noMove=false) {
    const unit = this.units.get(cellId);
    const movable = {};
    const actionable = {};

    const search4 = (y, x, stamina, init) => {
      if (!this.field.existsCell(y, x)) {
        return;
      }
      const ccid = this.field.cellId(y, x);
      const cost = this.field.cost(ccid, unit.klass().move);
      if (cost == 0) {
        return;
      }
      const eunit = this.units.get(ccid);
      if (eunit && unit.pnum != eunit.pnum) {
        return;
      }
      if (!init) {
        stamina -= cost;
      }
      if (stamina >= 0) {
        if (!movable[ccid] || stamina > movable[ccid]) {
          movable[ccid] = stamina;
          for (let range=unit.status().min_range; range<=unit.status().max_range; range++) {
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
    let move = unit.status().move;
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
    const unit = this.units.get(fromCid);
    if (!unit || this.units.get(toCid)) {
      return false;
    }
    let movable = false;

    const search4 = (y, x, stamina, init) => {
      if (!this.field.existsCell(y, x) || movable) {
        return;
      }
      const ccid = this.field.cellId(y, x);
      const cost = this.field.cost(ccid, unit.klass().move);
      if (cost == 0) {
        return;
      }
      const eunit = this.units.get(ccid);
      if (eunit && unit.pnum != eunit.pnum) {
        return;
      }
      if (!init) {
        stamina -= cost;
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
    search4(y, x, unit.status().move, true);
    return movable;
  }

  moveUnit(fromCid, toCid) {
    return this.set('units', this.units.withMutations(mnt => {
      mnt.set(toCid, mnt.get(fromCid));
      if (toCid != fromCid) {
        mnt.delete(fromCid);
      }
    }));
  }

  isActionable(unit, fromCid, toCid) {
    const target = this.units.get(toCid);
    if (!unit || unit.acted || unit.hp <= 0 || !target || target.hp <= 0) {
      return false;
    }
    if (unit.klass().healer) {
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
    actionable = (unit.status().min_range <= dist && dist <= unit.status().max_range);
    return actionable;
  }

  actUnit(fromCid, toCid) {
    const unit = this.units.get(fromCid);
    if (unit) {
      unit.acted = 1;
    }
    if (!toCid) {
      return this;
    }
    const target = this.units.get(toCid);

    unit.act(target, this.field.avoid(toCid));
    if (!unit.klass().healer && !target.klass().healer && this.isActionable(target, toCid, fromCid)) {
      target.act(unit, this.field.avoid(fromCid));
    }

    return this.set('units', this.units.withMutations(mnt => {
      if (unit.hp <= 0) {
        mnt.delete(fromCid);
      }
      if (target.hp <= 0) {
        mnt.delete(toCid);
      }
    }));
  }

  isEndPhase(pnum) {
    let ended = true;
    this.units.keySeq().forEach(key => {
      const unit = this.units.get(key);
      if (pnum == unit.pnum) {
        ended = unit.acted && ended;
      }
    });
    return ended;
  }

  resetUnitsActed() {
    this.units.keySeq().forEach(key => {
      this.units.get(key).acted = false;
    });
  }

  survivedCount() {
    let result = {};
    this.units.keySeq().forEach(key => {
      const unit = this.units.get(key);
      if (result[unit.pnum] == undefined) {
        result[unit.pnum] = 0;
      }
      result[unit.pnum] += 1;
    });
    return result;
  }

};
