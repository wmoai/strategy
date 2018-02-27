// @flow
import * as masterData from '../data/';
import type { UnitData } from '../data/unitData.js';
import type { KlassData } from '../data/klassData.js';
import Terrain from './Terrain.js';

export type UnitState = {
  cellId: number,
  hp: number,
  isActed: boolean,
};


const initialState: UnitState = {
  cellId: -1,
  hp: 0,
  isActed: false,
};

export default class Unit {
  isOffense: boolean;
  status: UnitData;
  klass: KlassData;
  seq: number;
  state: UnitState;

  constructor({ unitId, isOffense, seq, state }: {
    unitId: number,
    isOffense: boolean,
    seq: number,
    state: UnitState,
  }) {
    this.isOffense = isOffense;
    this.seq = seq;
    const unitData = masterData.unit.get(unitId);
    if (unitData) {
      this.status = unitData;
      const klassData = masterData.klass.get(unitData.klass);
      if (klassData) {
        this.klass = klassData;
      }
    }

    this.state = { ...initialState, hp: this.status.hp };
    if (state) {
      this.state = {...this.state, ...state};
    }
  }

  toData() {
    const { isOffense, seq, state } = this;
    return {
      unitId: this.status.id,
      isOffense,
      seq,
      state,
    };
  }

  isAlive() {
    return this.state.hp > 0;
  }

  move(cellId: number) {
    this.state = {...this.state, cellId};
  }

  setActed(isActed: boolean) {
    this.state = {...this.state, isActed};
  }

  actBy(actor: Unit, distance: number, terrain: Terrain) {
    const { state, status } = this;
    const { hp } = state;
    let variation = 0;
    if (actor.klass.healer) {
      variation = actor.status.str;
      const newHp = Math.min(hp + variation, status.hp);
      this.state = {...this.state, hp: newHp};
    } else {
      const ev = Math.random()*100;
      const threshold = this.hitRateBy(actor, distance, terrain);
      if (ev < threshold) {
        variation = this.calculatedEffectValueBy(actor);
        const newHp = Math.min(hp - variation, status.hp);
        this.state = {...this.state, hp: newHp};
      }
    }
    return variation;
  }

  hitRateBy(actor: Unit, distance: number, terrain: Terrain) {
    if (actor.klass.healer) {
      return 100;
    }
    const hitr = 100 + (actor.status.skl * 5) - ((distance-1) * 20) - (this.status.skl * 5);
    return Math.min(Math.max(Math.floor(hitr - terrain.avoidance), 0), 100);
  }

  critRateBy(actor: Unit) {
    if (actor.klass.healer) {
      return 0;
    }
    const crtr = actor.status.skl * 10;
    return Math.min(Math.max(Math.floor(crtr), 0), 100);
  }

  calculatedEffectValueBy(actor: Unit) {
    const val = this.effectValueBy(actor);
    if (Math.random()*100 < this.critRateBy(actor)) {
      return val * 2;
    }
    return val;
  }

  effectValueBy(actor: Unit) {
    const { status } = this;
    let result = 0;
    if (actor.klass.magical) {
      result = Math.max(actor.status.str - status.fth, 1);
    } else {
      result = Math.max(actor.status.str - status.dff, 1);
    }
    return result;
  }

  expectedEvaluationBy(actor: Unit, distance: number, terrain: Terrain) {
    if (actor.klass.healer) {
      return Math.min(actor.status.str, this.accumulatedDamage());
    }
    return this.effectValueBy(actor)
      * this.hitRateBy(actor, distance, terrain) / 100
      * (this.critRateBy(actor) / 100 + 1);
  }

  accumulatedDamage() {
    return this.status.hp - this.state.hp;
  }

}
