// @flow

import Unit from './Unit.js';
import type { UnitData } from  './Unit.js';
import Field from  './Field.js';
import * as masterData from '../data';

type GameState = {
  turnCount: number,
  turn: boolean,
  isEnd: boolean,
  winner: ?boolean,
}
type GameData = {
  fieldId: number,
  state: GameState,
  units: Array<UnitData>,
}

const initialState: GameState = {
  turnCount: 1,
  turn: true,
  isEnd: false,
  winner: null,
};


export default class Game {
  cost: number;
  defenseTurn: number;
  field: Field;
  state: GameState;
  units: Array<Unit>;


  constructor(data: GameData) {
    this.cost = 16;
    this.defenseTurn = 10;

    let fieldId;
    if (data) {
      fieldId = data.fieldId;
    }
    this.field = masterData.getField(fieldId);

    let state = {...initialState};
    let units = [];
    if (data) {
      if (data.state) {
        state = {...this.state, ...data.state};
      }
      if (data.units) {
        units = data.units.map(unit => new Unit(unit));
      }
    }
    this.state = state;
    this.units = units;
  }

  toData(): GameData {
    const { field, units, state } = this;
    return {
      fieldId: field.id,
      units: units.map(unit => unit.toData()),
      state,
    };
  }

  initUnits(unitsData: Array<UnitData>) {
    let unitSeq = 0;
    this.units = unitsData.map(unitData => new Unit({
      ...unitData,
      seq: unitSeq++
    }));
  }

  turnRemained(): number {
    return this.defenseTurn - Math.floor(this.state.turnCount / 2);
  }

  getUnit(cellId: number): Unit {
    return this.units.filter(unit => unit.state.cellId == cellId && unit.isAlive())[0];
  }

  ownedUnits(isOffense: boolean): Array<Unit> {
    return this.units.filter(unit => {
      return unit.isAlive() && unit.isOffense === isOffense;
    });
  }

  checkMovable(from: number, to: number): boolean {
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
    for(let l=0; l<5000; l++) {
      if (qs.length == 0 || isMovable) {
        break;
      }
      const minQ = qs.reduce((a, b) => ds[a] < ds[b] ? a : b);
      const u = Number(minQ);
      const spliceI = qs.indexOf(minQ);
      if (u == null || ds[u] > status.move || spliceI == null) {
        break;
      }
      qs.splice(spliceI, 1)[0];
      [u-field.width, u-1, u+1, u+field.width].forEach(v => {
        const { y, x } = field.coordinates(v);
        if (!field.isActiveCell(y, x)) {
          return;
        }
        const newD = ds[u] + masterData.getTerrain(field.cellTerrainId(v)).cost.get(klass.move);
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

  checkActionable(unit: Unit, from: number, to: number): boolean {
    const target = this.getUnit(to);
    if (!unit || unit.state.isActed || !unit.isAlive() || !target || !target.isAlive()) {
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

  actUnit(from: number, to: number) {
    const actor = this.getUnit(from);
    const target = this.getUnit(to);
    const newUnits = Array.from(this.units);

    const actorIndex = newUnits.indexOf(actor);
    actor.setActed(true);

    if (target) {
      const targetIndex = newUnits.indexOf(target);
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
  }

  mightChangeTurn() {
    if (this.shouldEndTurn()) {
      this.changeTurn();
    }
  }

  shouldEndTurn(): boolean {
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
      turnCount: turnCount+1,
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
    const flags = this.units.filter(unit => unit.isAlive())
      .map(unit => unit.isOffense)
      .filter((x, i, self) => self.indexOf(x) === i);

    // Annihilation victory
    if (flags.length == 1) {
      this.state = {
        ...this.state,
        isEnd: true,
        winner: flags[0],
      };
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
      this.state = {
        ...this.state,
        isEnd: true,
        winner: true,
      };
    }

    // Defence victory
    if (this.state.turnCount >= this.defenseTurn*2) {
      this.state = {
        ...this.state,
        isEnd: true,
        winner: false,
      };
    }
  }

  fixAction(from: number, to: number, target: number) {
    this.moveUnit(from, to);
    this.actUnit(to, target);
    this.mightChangeTurn();
    this.mightEndGame();
  }


}
