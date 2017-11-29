const Immutable = require('immutable');
const resource = require('../data/');

module.exports = class Unit extends Immutable.Record({
  seq: null,
  offense: null,
  unitId: null,
  cellId: null,
  hp: 0,
  acted: false,

  status: null,
  klass: null,
}) {

  constructor(options) {
    super(options);
    return this.withMutations(mnt => {
      const status = resource.unit[this.unitId];
      mnt.set('status', status)
        .set('klass', resource.klass[status.klass]);
    });
  }

  static create(args) {
    const unit = new Unit(args);
    return unit.set('hp', unit.status.hp);
  }

  isAlive() {
    return this.hp > 0;
  }

  move(cellId) {
    return this.set('cellId', cellId);
  }

  actBy(actor, terrainAvoidance=0) {
    if (!actor) {
      return this;
    }
    if (actor.klass.healer) {
      return this.set(
        'hp',
        Math.min(this.hp + actor.status.pow, this.status.hp)
      );
    } else {
      if (Math.random()*100 < this.hitRateBy(actor, terrainAvoidance)) {
        return this.set(
          'hp', 
          Math.max(this.hp - this.calculatedEffectValueBy(actor), 0)
        );
      }
    }
    return this;
  }

  hitRateBy(actor, terrainAvoidance=0) {
    if (!actor) {
      return 0;
    }
    if (actor.klass.healer) {
      return 100;
    }
    const hitr = actor.status.hit;
    const avoidr = this.status.luc;
    return Math.min(Math.max(Math.floor(hitr - avoidr - terrainAvoidance), 0), 100);
  }

  critRateBy(actor) {
    if (actor.klass.healer) {
      return 0;
    }
    const crtr = actor.status.skl;
    const prtr = this.status.luc;
    return Math.min(Math.max(Math.floor(crtr - prtr), 0), 100);
  }

  effectValueBy(actor) {
    if (!actor) {
      return 0;
    }
    let result = 0;
    if (actor.klass.magical) {
      result = Math.max(actor.status.pow - this.status.fth, 1);
    } else {
      result = Math.max(actor.status.pow - this.status.dff, 1);
    }
    return result;
  }

  calculatedEffectValueBy(actor) {
    const val = this.effectValueBy(actor);
    if (Math.random()*100 < this.critRateBy(actor)) {
      return val * 2;
    }
    return val;
  }

  expectedEvaluationBy(actor, terrainAvoidance=0) {
    if (actor.klass.healer) {
      return Math.min(actor.status.pow, this.accumulatedDamage());
    }
    return this.effectValueBy(actor)
      * this.hitRateBy(actor, terrainAvoidance) / 100
      * (this.critRateBy(actor) / 100 + 1);
  }

  accumulatedDamage() {
    return this.status.hp - this.hp;
  }

};
