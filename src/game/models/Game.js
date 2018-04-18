// @flow

import Unit from './Unit.js';
import Field from './Field.js';
import * as masterData from '../data';

type GameState = {
  turnCount: number,
  turn: boolean,
  isEnd: boolean,
  winner: ?boolean
};
type ForecastUnit = {
  name: string,
  klass: number,
  hp: number,
  isOffense: boolean,
  val: number,
  hit: number,
  crit: number
};
export type Forecast = {
  me: ForecastUnit,
  tg: ForecastUnit
};
export type HpChange = {
  unitSeq: number,
  hp: number
};

const initialState: GameState = {
  turnCount: 1,
  turn: false,
  isEnd: false,
  winner: null
};

export default class Game {
  cost: number;
  defenseTurn: number;
  field: Field;
  state: GameState;
  units: Array<Unit>;

  constructor(data?: any) {
    this.cost = 16;
    this.defenseTurn = 10;

    let fieldId;
    if (data) {
      fieldId = data.fieldId;
    }
    const field = masterData.getField(fieldId);
    this.defenseTurn = field.turn();
    this.field = field;

    let state = { ...initialState };
    let units = [];
    if (data) {
      if (data.state) {
        state = { ...this.state, ...data.state };
      }
      if (data.units) {
        units = data.units.map(unit => new Unit(unit));
      }
    }
    this.state = state;
    this.units = units;
  }

  toData() {
    const { field, units, state } = this;
    return {
      fieldId: field.id,
      units: units.map(unit => unit.toData()),
      state
    };
  }

  initUnits(unitsData: Array<any>) {
    let unitSeq = 0;
    this.units = unitsData.map(
      unitData =>
        new Unit({
          ...unitData,
          seq: unitSeq++
        })
    );
  }

  turnRemained() {
    return this.defenseTurn - Math.floor(this.state.turnCount / 2);
  }

  getUnit(cellId: number) {
    const buff = this.units.filter(
      unit => unit.state.cellId == cellId && unit.isAlive()
    );
    if (buff.length !== 1) {
      return null;
    }
    return buff[0];
  }

  ownedUnits(isOffense: boolean) {
    return this.units.filter(unit => {
      return unit.isAlive() && unit.isOffense === isOffense;
    });
  }

  checkMovable(from: number, to: number) {
    if (from == to) {
      return true;
    }
    const { field } = this;
    const unit = this.getUnit(from);
    if (!unit) {
      return false;
    }
    const { status, klass } = unit;

    const ds = field.terrain.map((terrain, i) => {
      return i == from ? 0 : Infinity;
    });
    const qs = Array.from(ds.keys());

    let isMovable = false;
    for (let l = 0; l < 5000; l++) {
      if (qs.length == 0 || isMovable) {
        break;
      }
      const minQ = qs.reduce((a, b) => (ds[a] < ds[b] ? a : b));
      const u = Number(minQ);
      const spliceI = qs.indexOf(minQ);
      if (u == null || ds[u] > status.move || spliceI == null) {
        break;
      }
      qs.splice(spliceI, 1)[0];
      [u - field.width, u - 1, u + 1, u + field.width].forEach(v => {
        const { y, x } = field.coordinates(v);
        if (!field.isActiveCell(y, x)) {
          return;
        }
        const newD =
          ds[u] +
          masterData.getTerrain(field.cellTerrainId(v)).cost.get(klass.move);
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

  moveUnit(from: number, to: number) {
    this.units = this.units.map(unit => {
      const { cellId } = unit.state;
      if (cellId == from) {
        unit.move(to);
      }
      return unit;
    });
  }

  checkActionable(unit: Unit, from: number, to: number) {
    const target = this.getUnit(to);
    if (
      !unit ||
      unit.state.isActed ||
      !unit.isAlive() ||
      !target ||
      !target.isAlive()
    ) {
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
    actionable = unit.status.min_range <= dist && dist <= unit.status.max_range;
    return actionable;
  }

  getForecast(unit: Unit, from: number, to: number) {
    const target = this.getUnit(to);
    if (!target || !this.checkActionable(unit, from, to)) {
      return;
    }
    const { field } = this;
    const distance = field.distance(from, to);

    const me: ForecastUnit = {
      name: unit.status.name,
      klass: unit.klass.id,
      hp: unit.state.hp,
      isOffense: unit.isOffense,
      val: 0,
      hit: 0,
      crit: 0
    };
    const tg: ForecastUnit = {
      name: target.status.name,
      klass: target.klass.id,
      hp: target.state.hp,
      isOffense: target.isOffense,
      val: 0,
      hit: 0,
      crit: 0
    };
    if (unit.klass.healer) {
      me.val = unit.status.str;
    } else {
      me.val = target.effectValueBy(unit);
      me.hit = target.hitRateBy(
        unit,
        distance,
        masterData.getTerrain(field.cellTerrainId(to))
      );
      me.crit = target.critRateBy(unit);
    }
    if (!unit.klass.healer && !target.klass.healer) {
      //counter attack
      if (this.checkActionable(target, to, from)) {
        tg.val = unit.effectValueBy(target);
        tg.hit = unit.hitRateBy(
          target,
          distance,
          masterData.getTerrain(field.cellTerrainId(from))
        );
        tg.crit = unit.critRateBy(target);
      }
    }
    return { me, tg };
  }

  actUnit(from: number, to: ?number) {
    const actor = this.getUnit(from);
    if (!actor) {
      return;
    }
    const { field } = this;
    const newUnits = Array.from(this.units);

    const actorIndex = newUnits.indexOf(actor);
    if (actor.isOffense === this.state.turn) {
      actor.setActed(true);
    }

    let change;
    if (to != null) {
      const target = this.getUnit(to);
      if (target) {
        const targetIndex = newUnits.indexOf(target);
        target.actBy(
          actor,
          field.distance(from, to),
          masterData.getTerrain(field.cellTerrainId(to))
        );
        newUnits[targetIndex] = target;
        change = {
          seq: target.seq,
          hp: target.state.hp
        };
      }
    }
    newUnits[actorIndex] = actor;
    this.units = newUnits;

    return change;
  }

  mightCounter(from: ?number, to: number) {
    if (from == null) {
      return;
    }
    const actor = this.getUnit(from);
    const target = this.getUnit(to);
    if (
      actor &&
      !actor.klass.healer &&
      target &&
      !target.klass.healer &&
      this.checkActionable(actor, from, to)
    ) {
      return this.actUnit(from, to);
    }
  }

  mightChangeTurn() {
    if (this.shouldEndTurn()) {
      this.changeTurn();
    }
  }

  shouldEndTurn() {
    let ended = true;
    const { turn } = this.state;
    this.units.filter(unit => unit.isAlive()).forEach(unit => {
      if (turn == unit.isOffense) {
        ended = unit.state.isActed && ended;
      }
    });
    return ended;
  }

  changeTurn() {
    const { turn, turnCount } = this.state;
    this.resetUnitsActed();
    this.state = {
      ...this.state,
      turn: !turn,
      turnCount: turnCount + 1
    };
    this.mightEndGame();
  }

  resetUnitsActed() {
    this.units = this.units.map(unit => {
      unit.setActed(false);
      return unit;
    });
  }

  mightEndGame() {
    const flags = this.units
      .filter(unit => unit.isAlive())
      .map(unit => unit.isOffense)
      .filter((x, i, self) => self.indexOf(x) === i);

    // Annihilation victory
    if (flags.length == 1) {
      this.endGame(flags[0]);
      return;
    }

    // Occupation victory
    let occupied = false;
    this.field.info.base.forEach(basePoint => {
      const unit = this.getUnit(basePoint);
      if (unit && unit.isOffense) {
        occupied = true;
      }
    });
    if (occupied) {
      this.endGame(true);
    }

    // Defence victory
    if (this.state.turnCount >= this.defenseTurn * 2) {
      this.endGame(false);
    }
  }

  endGame(winner: boolean) {
    this.state = {
      ...this.state,
      isEnd: true,
      winner
    };
  }

  fixAction(from: number, to: number, target: ?number) {
    let changes = [];
    this.moveUnit(from, to);
    const c1 = this.actUnit(to, target);
    if (c1) {
      changes.push(c1);
    }
    const c2 = this.mightCounter(target, to);
    if (c2) {
      changes.push(c2);
    }
    this.mightChangeTurn();
    this.mightEndGame();

    return changes;
  }
}
