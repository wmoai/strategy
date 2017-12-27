// @flow

type UnitState = {
  cellId: number,
  hp: number,
  isActed: boolean,
};
export type UnitData = {
  unitId: number,
  isOffense: boolean,
  seq: number,
  state: UnitState,
};
type UnitStatus = {
  name: string,
  id: number,
  hp: number,
  pow: number,
  dff: number,
  fth: number,
  skl: number,
  luc: number,
  hit: number,
  move: number,
  min_range: number,
  max_range: number,
  cost: number,
  klass: number,
};
type UnitClass = {
  name: string,
  id: number,
  magical: number,
  healer: number,
  move: string,
};

import * as masterData from '../data/';

const initialState: UnitState = {
  cellId: -1,
  hp: 0,
  isActed: false,
};

export default class Unit {
  isOffense: boolean;
  status: UnitStatus;
  klass: UnitClass;
  seq: number;
  state: UnitState;

  constructor({ unitId, isOffense, seq, state }: UnitData) {
    this.isOffense = isOffense;
    this.seq = seq;
    this.status = masterData.unit[unitId];
    this.klass = masterData.klass[this.status.klass];

    this.state = { ...initialState, hp: this.status.hp };
    if (state) {
      this.state = {...this.state, ...state};
    }
  }

  toData(): UnitData {
    const { isOffense, seq, state } = this;
    return {
      unitId: this.status.id,
      isOffense,
      seq,
      state,
    };
  }

  isAlive(): boolean {
    return this.state.hp > 0;
  }

  move(cellId: number) {
    this.state = {...this.state, cellId};
  }

  setActed(isActed: boolean) {
    this.state = {...this.state, isActed};
  }

  actBy(actor: Unit, terrainAvoidance: number=0) {
    const { state, status } = this;
    const { hp } = state;
    if (actor.klass.healer) {
      const newHp = Math.min(hp + actor.status.pow, status.hp);
      this.state = {...this.state, hp: newHp};
    } else {
      if (Math.random()*100 < this.hitRateBy(actor, terrainAvoidance)) {
        const newHp = Math.max(hp - this.calculatedEffectValueBy(actor), 0);
        this.state = {...this.state, hp: newHp};
      }
    }
  }

  hitRateBy(actor: Unit, terrainAvoidance: number=0): number {
    if (actor.klass.healer) {
      return 100;
    }
    const hitr = actor.status.hit;
    const avoidr = this.status.luc;
    return Math.min(Math.max(Math.floor(hitr - avoidr - terrainAvoidance), 0), 100);
  }

  critRateBy(actor: Unit): number {
    if (actor.klass.healer) {
      return 0;
    }
    const crtr = actor.status.skl;
    const prtr = this.status.luc;
    return Math.min(Math.max(Math.floor(crtr - prtr), 0), 100);
  }

  calculatedEffectValueBy(actor: Unit): number {
    const val = this.effectValueBy(actor);
    if (Math.random()*100 < this.critRateBy(actor)) {
      return val * 2;
    }
    return val;
  }

  effectValueBy(actor: Unit): number {
    const { status } = this;
    let result = 0;
    if (actor.klass.magical) {
      result = Math.max(actor.status.pow - status.fth, 1);
    } else {
      result = Math.max(actor.status.pow - status.dff, 1);
    }
    return result;
  }

  expectedEvaluationBy(actor: Unit, terrainAvoidance: number=0): number {
    if (actor.klass.healer) {
      return Math.min(actor.status.pow, this.accumulatedDamage());
    }
    return this.effectValueBy(actor)
      * this.hitRateBy(actor, terrainAvoidance) / 100
      * (this.critRateBy(actor) / 100 + 1);
  }

  accumulatedDamage(): number {
    return this.status.hp - this.state.hp;
  }

}
