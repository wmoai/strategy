const Immutable = require('immutable');
// const Unit = require('./Unit.js');
const createUnit = require('./createUnit.js');

const masterData = require('../data');

const defenceTurn = 10;
let unitSeq = 0;

module.exports = class Game extends Immutable.Record({
  cost: 16,
  fieldId: null,
  field: null,
  // units: Immutable.List(),
  units: [],
  turnCount: 1,
  turn: true,
  isEnd: false,
  winner: null,
}) {

  toData() {
    const data = {
      cost: this.cost,
      fieldId: this.fieldId,
      // units: this.units.map(unit => unit.toJSON()).toArray(),
      units: this.units.map(unit => unit.toData()),
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
        // .set('units', Immutable.List(data.units.map(unit => new Unit(unit))));
        .set('units', data.units.map(data => createUnit(data)));
    });
  }

  setField(fieldId) {
    let fid = fieldId ? fieldId : this.fieldId;
    const field = masterData.getField(fid);
    if (fid == null) {
      fid = field.id;
    }
    return this.withMutations(mnt => {
      mnt.set('fieldId', fid)
        .set('field', field);
    });
  }

  initUnits(units) {
    // return  this.set('units', Immutable.List(units.map(unit => unit.set('seq', unitSeq++))));
    return  this.set('units', Array.from(units.map(unit => {
      unit.setSequence(unitSeq++);
      return unit;
    })));
  }

  turnRemained() {
    return defenceTurn - Math.floor(this.turnCount / 2);
  }

  unit(cellId) {
    return this.units.filter(unit => unit.getState().cellId == cellId && unit.isAlive())[0];
  }

  ownedUnits(isOffense) {
    return this.units.filter(unit => {
      return unit.isAlive() && unit.isOffense === isOffense;
    });
  }

  checkMovable(from, to) {
    if (from == to) {
      return true;
    }
    const { field } = this;
    const unit = this.unit(from);
    if (!unit) {
      return false;
    }
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
        const newD = ds[u] + masterData.terrain[field.cellTerrainId(v)].cost.get(klass.move);
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

  changeUnit(from, to) {
    return this.set('units', Array.from(this.units.map(unit => {
      // if (unit.cellId == from) {
      const { cellId } = unit.getState();
      if (cellId == from) {
        return unit.move(to);
      // } else if (unit.getState().cellId == to) {
      } else if (cellId == to) {
        return unit.move(from);
      }
      return unit;
    })));
  }

  moveUnit(from, to) {
    const newUnits = Array.from(this.units.map(unit => {
      const { cellId } = unit.getState();
      if (cellId == from) {
        unit.move(to);
      }
      return unit;
    }));
    return this.set('units', newUnits);
  }

  checkActionable(unit, from, to) {
    const target = this.unit(to);
    if (!unit || unit.getState().isActed || !unit.isAlive() || !target || !target.isAlive()) {
      return false;
    }
    if (unit.klass.healer) {
      if (unit.isOffense != target.isOffense) {
        return false;
      }
    } else {
      if (unit.isOffense == target.isOffense) {
        return false;
      }
    }

    let actionable = false;
    const dist = this.field.distance(from, to);
    actionable = (unit.status.min_range <= dist && dist <= unit.status.max_range);
    return actionable;
  }

  actUnit(from, to) {
    // let actor = this.unit(from);
    // let target = this.unit(to);
    // return this.set('units', this.units.withMutations(mnt => {
      // const actorIndex = mnt.indexOf(actor);
      // actor = actor.set('isActed', 1);

      // if (target) {
        // const targetIndex = mnt.indexOf(target);
        // target = target.actBy(actor);
        // if (
          // !actor.klass.healer
          // && !target.klass.healer
          // && this.checkActionable(target, to, from)
        // ) {
          // actor = actor.actBy(target);
        // }
        // mnt.set(targetIndex, target);
      // }
      // mnt.set(actorIndex, actor);
    // }));

    const actor = this.unit(from);
    const target = this.unit(to);
    const newUnits = Array.from(this.units);

    const actorIndex = this.units.indexOf(actor);
    actor.setActed(true);

    if (target) {
      const targetIndex = this.units.indexOf(target);
      target.actBy(actor);
      if (
        !actor.klass.healer
        && !target.klass.healer
        && this.checkActionable(target, to, from)
      ) {
        actor.actBy(target);
      }
      newUnits[targetIndex] = target;
    }
    newUnits[actorIndex] = actor;
    this.units = newUnits;
    return this;
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
      if (this.turn == unit.isOffense) {
        ended = unit.getState().isActed && ended;
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
      // this.units.map(unit => {
        // return unit.set('isActed', false);
      // })
      Array.from(this.units.map(unit => {
        unit.setActed(false);
        return unit;
      }))
    );
  }

  mightEndGame() {
    const flags = this.units
      .filter(unit => unit.isAlive())
      .map(unit => unit.isOffense)
      .filter((x, i, self) => self.indexOf(x) === i);

    // Annihilation victory
    if (flags.length == 1) {
      return this.withMutations(mnt => {
        mnt.set('isEnd', true)
          .set('winner', flags[0]);
      });
    }

    // Occupation victory
    let occupied = false;
    this.field.info.base.forEach(basePoint => {
      const unit = this.unit(basePoint);
      if (unit && unit.isOffense) {
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
