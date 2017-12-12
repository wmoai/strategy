const Immutable = require('immutable');
const Unit = require('./Unit.js');

const resource = require('../data');

const defenceTurn = 10;
let unitSeq = 0;

module.exports = class Game extends Immutable.Record({
  cost: 16,
  fieldId: null,
  field: null,
  units: Immutable.List(),
  turnCount: 1,
  turn: true,
  isEnd: false,
  winner: null,
}) {

  toData() {
    const data = {
      cost: this.cost,
      fieldId: this.fieldId,
      units: this.units.map(unit => unit.toJSON()).toArray(),
      turnCount: this.turnCount,
      turn: this.turn,
      isEnd: this.isEnd,
      winner: this.winner,
    };
    return data;
  }

  static restore(data) {
    return (new Game(data)).withMutations(mnt => {
      mnt.setField()
        .set('units', Immutable.List(data.units.map(unit => new Unit(unit))));
    });
  }

  setField(fieldId) {
    let fid = fieldId ? fieldId : this.fieldId;
    const field = resource.getField(fid);
    if (fid == null) {
      fid = field.id;
    }
    return this.withMutations(mnt => {
      mnt.set('fieldId', fid)
        .set('field', field);
    });
  }

  initUnits(units) {
    return  this.set('units', Immutable.List(units.map(unit => unit.set('seq', unitSeq++))));
  }

  turnRemained() {
    return defenceTurn - Math.floor(this.turnCount / 2);
  }

  unit(cellId) {
    return this.units.filter(unit => unit.cellId == cellId && unit.isAlive()).first();
  }

  ownedUnits(offense) {
    return this.units.filter(unit => {
      return unit.isAlive() && unit.offense === offense;
    });
  }

  checkMovable(from, to) {
    const { field } = this;
    const unit = this.unit(from);
    const { status, klass } = unit;

    const ds = field.terrain.map((terrain, i) => {
      return i == from ? 0 : Infinity;
    });
    const qs = Object.keys(ds);

    let isMovable = false;
    for(let l=0; l<5000; l++) {
      if (qs.length == 0 || isMovable) {
        break;
      }
      let minD = Infinity;
      let u;
      let spliceI;
      qs.forEach((q, i) => {
        if (minD > ds[q]) {
          minD = ds[q];
          u = Number(q);
          spliceI = i;
        }
      });
      if (u == null || ds[u] > status.move) {
        break;
      }
      qs.splice(spliceI, 1)[0];
      [u-field.width, u-1, u+1, u+field.width].forEach(v => {
        const { y, x } = field.coordinates(v);
        if (!field.isActiveCell(y, x)) {
          return;
        }
        const newD = ds[u] + field.cost(v, klass.move);
        if (ds[v] <= newD || newD > status.move) {
          return;
        }
        ds[v] = newD;
        if (to == v) {
          isMovable = true;
        }
      });
    }
    return isMovable;
  }

  // checkMovable(from, to) {
    // if (from == to) {
      // return true;
    // }
    // const unit = this.unit(from);
    // if (!unit || this.unit(to) || unit.acted) {
      // return false;
    // }
    // const klass = unit.klass;
    // let movable = false;
    // let movableMap = new Map();

    // const search4 = (y, x, stamina, init) => {
      // if (!this.field.existsCell(y, x) || movable) {
        // return;
      // }
      // const ccid = this.field.cellId(y, x);
      // const cost = this.field.cost(ccid, klass.move);
      // if (cost == 0) {
        // return;
      // }
      // const eunit = this.unit(ccid);
      // if (eunit && unit.offense != eunit.offense) {
        // return;
      // }
      // if (!init) {
        // stamina -= cost;
      // }
      // if (stamina >= 0) {
        // if (!movableMap.get(ccid) || stamina > movableMap.get(ccid)) {
          // movableMap.set(ccid, stamina);
          // movable = (to == ccid);
          // search4(y-1, x, stamina);
          // search4(y+1, x, stamina);
          // search4(y, x-1, stamina);
          // search4(y, x+1, stamina);
        // }
      // }
    // };
    // const { y, x } = this.field.coordinates(from);
    // search4(y, x, unit.status.move, true);
    // return movable;
  // }

  changeUnit(from, to) {
    return this.set('units', this.units.map(unit => {
      if (unit.cellId == from) {
        return unit.move(to);
      } else if (unit.cellId == to) {
        return unit.move(from);
      }
      return unit;
    }));
  }

  moveUnit(from, to) {
    return this.set('units', this.units.map(unit => {
      if (unit.cellId == from) {
        return unit.move(to);
      }
      return unit;
    }));
  }

  checkActionable(unit, from, to) {
    const target = this.unit(to);
    if (!unit || unit.acted || unit.hp <= 0 || !target || target.hp <= 0) {
      return false;
    }
    if (unit.klass.healer) {
      if (unit.offense != target.offense) {
        return false;
      }
    } else {
      if (unit.offense == target.offense) {
        return false;
      }
    }

    let actionable = false;
    const dist = this.field.distance(from, to);
    actionable = (unit.status.min_range <= dist && dist <= unit.status.max_range);
    return actionable;
  }

  actUnit(from, to) {
    let actor = this.unit(from);
    let target = this.unit(to);

    return this.set('units', this.units.withMutations(mnt => {
      const actorIndex = mnt.indexOf(actor);
      actor = actor.set('acted', 1);

      if (target) {
        const targetIndex = mnt.indexOf(target);
        target = target.actBy(actor);
        if (
          !actor.klass.healer
          && !target.klass.healer
          && this.checkActionable(target, to, from)
        ) {
          actor = actor.actBy(target);
        }
        mnt.set(targetIndex, target);
      }
      mnt.set(actorIndex, actor);
    }));
  }

  mightChangeTurn() {
    if (this.shouldEndTurn()) {
      return this.changeTurn();
    }
    return this;
  }

  shouldEndTurn() {
    let ended = true;
    this.units.filter(unit => {
      return unit.isAlive();
    }).forEach(unit => {
      if (this.turn == unit.offense) {
        ended = unit.acted && ended;
      }
    });
    return ended;
  }

  changeTurn() {
    return this.withMutations(mnt => {
      mnt.resetUnitsActed()
        .set('turn', !mnt.turn)
        .set('turnCount', this.turnCount+1)
        .mightEndGame();
    });
  }

  resetUnitsActed() {
    return this.set(
      'units',
      this.units.map(unit => {
        return unit.set('acted', false);
      })
    );
  }

  mightEndGame() {
    const flags = this.units
      .filter(unit => unit.isAlive())
      .map(unit => unit.offense)
      .filter((x, i, self) => self.indexOf(x) === i);

    // Annihilation victory
    if (flags.count() == 1) {
      return this.withMutations(mnt => {
        mnt.set('isEnd', true)
          .set('winner', flags.first());
      });
    }

    // Occupation victory
    let occupied = false;
    this.field.info.base.forEach(basePoint => {
      const unit = this.unit(basePoint);
      if (unit && unit.offense) {
        occupied = true;
      }
    });
    if (occupied) {
      return this.withMutations(mnt => {
        mnt.set('isEnd', true)
          .set('winner', true);
      });
    }

    // Defence victory
    if (this.turnCount >= defenceTurn*2) {
      return this.withMutations(mnt => {
        mnt.set('isEnd', true)
          .set('winner', false);
      });
    }
    return this;
  }

  fixAction(from, to, target) {
    return this.withMutations(mnt => {
      mnt.moveUnit(from, to)
        .actUnit(to, target)
        .mightChangeTurn()
        .mightEndGame();
    });
  }

};
