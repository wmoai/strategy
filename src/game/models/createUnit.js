
const masterData = require('../data/');

const initialState = {
  seq: null,
  cellId: null,
  hp: 0,
  isActed: false,
};

module.exports = ({ isOffense, unitId, state={} }) => {

  const status = masterData.unit[unitId];
  const klass = masterData.klass[status.klass];

  let currentState = { ...initialState, hp: status.hp };
  if (state) {
    currentState = {...currentState, ...state};
  }

  function toData() {
    return {
      isOffense,
      unitId,
      state: getState(),
    };
  }

  function setSequence(seq) {
    currentState = {...currentState, seq};
  }

  function getState() {
    return currentState;
  }

  function setCellId(cellId) {
    currentState = {...currentState, cellId};
  }

  function isAlive() {
    return currentState.hp > 0;
  }

  function move(cellId) {
    currentState = {...currentState, cellId};
  }

  function setActed(isActed) {
    currentState = {...currentState, isActed};
  }

  function actBy(actor, terrainAvoidance=0) {
    const { hp } = currentState;
    if (actor.klass.healer) {
      const newHp = Math.min(hp + actor.status.pow, status.hp);
      currentState = {...currentState, hp: newHp };
    } else {
      if (Math.random()*100 < hitRateBy(actor, terrainAvoidance)) {
        const newHp = Math.max(hp - calculatedEffectValueBy(actor), 0);
        currentState = {...currentState, hp: newHp };
      }
    }
  }

  function hitRateBy(actor, terrainAvoidance=0) {
    if (actor.klass.healer) {
      return 100;
    }
    const hitr = actor.status.hit;
    const avoidr = status.luc;
    return Math.min(Math.max(Math.floor(hitr - avoidr - terrainAvoidance), 0), 100);
  }

  function critRateBy(actor) {
    if (actor.klass.healer) {
      return 0;
    }
    const crtr = actor.status.skl;
    const prtr = status.luc;
    return Math.min(Math.max(Math.floor(crtr - prtr), 0), 100);
  }

  function calculatedEffectValueBy(actor) {
    const val = effectValueBy(actor);
    if (Math.random()*100 < critRateBy(actor)) {
      return val * 2;
    }
    return val;
  }

  function effectValueBy(actor) {
    let result = 0;
    if (actor.klass.magical) {
      result = Math.max(actor.status.pow - status.fth, 1);
    } else {
      result = Math.max(actor.status.pow - status.dff, 1);
    }
    return result;
  }

  function expectedEvaluationBy(actor, terrainAvoidance=0) {
    if (actor.klass.healer) {
      return Math.min(actor.status.pow, accumulatedDamage());
    }
    return effectValueBy(actor)
      * hitRateBy(actor, terrainAvoidance) / 100
      * (critRateBy(actor) / 100 + 1);
  }

  function accumulatedDamage() {
    return status.hp - currentState.hp;
  }


  return {
    isOffense,
    status,
    klass,

    toData,
    setSequence,
    getState,
    setCellId,
    isAlive,
    move,
    setActed,
    actBy,
    hitRateBy,
    critRateBy,
    expectedEvaluationBy,
    effectValueBy,
  };
};
