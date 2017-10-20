const Immutable = require('immutable');
const Unit = require('./Unit.js');
const Field = require('./Field.js');

const defenceTurn = 15;

module.exports = class Game extends Immutable.Record({
  cost: 16,
  field: null,
  units: Immutable.List(),
  turnCount: 1,
  turn: true,
  isEnd: false,
  winner: undefined,
}) {

  toData(initial=false) {
    const data = {
      _state: this._state,
      units: this.units.map(unit => unit.toJS()),
      turnCount: this.turnCount,
      turn: this.turn,
      isEnd: this.isEnd,
      winner: this.winner,
    };
    if (initial) {
      //FIXME
      data.field = null;
    }
    return data;
  }

  static restore(data) {
    return new Game(data)
      .set('field', Field.init())
      .set('units', Immutable.List(data.units.map(unit => new Unit(unit))));
  }

  initUnits(units) {
    return  this.set('units', Immutable.List(units));
  }

  remainingTurn() {
    return defenceTurn - Math.floor(this.turnCount / 2);
  }

  unit(cellId) {
    return this.units.filter(unit => unit.cellId == cellId && unit.isAlive()).first();
  }

  myUnits(offense) {
    return this.units.filter(unit => unit.offense == offense);
  }

  checkMovable(from, to) {
    if (from == to) {
      return true;
    }
    const unit = this.unit(from);
    if (!unit || this.unit(to)) {
      return false;
    }
    const klass = unit.klass();
    let movable = false;
    let movableMap = new Map();

    const search4 = (y, x, stamina, init) => {
      if (!this.field.existsCell(y, x) || movable) {
        return;
      }
      const ccid = this.field.cellId(y, x);
      const cost = this.field.cost(ccid, klass.move);
      if (cost == 0) {
        return;
      }
      const eunit = this.unit(ccid);
      if (eunit && unit.offense != eunit.offense) {
        return;
      }
      if (!init) {
        stamina -= cost;
      }
      if (stamina >= 0) {
        if (!movableMap.get(ccid) || stamina > movableMap.get(ccid)) {
          movableMap.set(ccid, stamina);
          movable = (to == ccid);
          search4(y-1, x, stamina);
          search4(y+1, x, stamina);
          search4(y, x-1, stamina);
          search4(y, x+1, stamina);
        }
      }
    };
    const [y, x] = this.field.coordinates(from);
    search4(y, x, unit.status().move, true);
    return movable;
  }

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
    if (unit.klass().healer) {
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
    actionable = (unit.status().min_range <= dist && dist <= unit.status().max_range);
    return actionable;
  }

  actUnit(from, to) {
    let actor = this.unit(from);
    let target = this.unit(to);
    return this.set('units', this.units.withMutations(mnt => {
      if (!actor) {
        return;
      }
      const actorIndex = mnt.indexOf(actor);
      actor = actor.set('acted', 1);
      mnt.set(actorIndex, actor);
    
      if (target) {
        let active = actor 
          , passive = target;
        // FIXME matibuse
        // if (!active.klass().healer && passive.skill && passive.skill.is('ambush')) {
          // active = target;
          // passive = actor;
        // }

        const passiveIndex = mnt.indexOf(passive);
        passive = passive.actBy(active);
        mnt.set(passiveIndex, passive);

        // counter
        if (!active.klass().healer
          && !passive.klass().healer
          && this.checkActionable(passive, to, from)) {

          const activeIndex = mnt.indexOf(active);
          active = active.actBy(passive);
          mnt.set(activeIndex, active);
        }
      }
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
    this.units.filter(unit => unit.isAlive()).forEach(unit => {
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
        .set('turnCount', this.turnCount+1);
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

};
