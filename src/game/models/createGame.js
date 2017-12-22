const createUnit = require('./createUnit.js');

const masterData = require('../data');

const initialState = {
  units: [],
  turnCount: 1,
  turn: true,
  isEnd: false,
  winner: null,
};


module.exports = (options) => {

  const cost = 16;
  const defenceTurn = 10;

  let fieldId;
  if (options) {
    fieldId = options.fieldId;
  }
  const field = masterData.getField(fieldId);
  fieldId = field.id;


  let currentState = {...initialState};
  if (options && options.state) {
    currentState = {...currentState, ...options.state};
  }

  function getState() {
    return currentState;
  }

  function toData() {
    return {
      fieldId,
      state: {
        ...currentState,
        units: currentState.units.map(unit => unit.toData()),
      },
    };
  }

  function initUnits(units) {
    let unitSeq = 0;
    currentState = {
      ...currentState,
      units: Array.from(units.map(unit => {
        unit.setSequence(unitSeq++);
        return unit;
      }))
    };
  }

  function getUnits() {
    return currentState.untis.map(unit => {
      return createUnit(unit);
    });
  }

  function turnRemained() {
    return defenceTurn - Math.floor(currentState.turnCount / 2);
  }

  function getUnit(cellId) {
    return currentState.units.filter(unit => unit.getState().cellId == cellId && unit.isAlive())[0];
  }

  function ownedUnits(isOffense) {
    return currentState.units.filter(unit => {
      return unit.isAlive() && unit.isOffense === isOffense;
    });
  }

  function checkMovable(from, to) {
    if (from == to) {
      return true;
    }
    const unit = getUnit(from);
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

  function moveUnit(from, to) {
    currentState = {
      ...currentState,
      units: Array.from(currentState.units.map(unit => {
        const { cellId } = unit.getState();
        if (cellId == from) {
          unit.move(to);
        }
        return unit;
      }))
    };
  }

  function checkActionable(unit, from, to) {
    const target = getUnit(to);
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
    const dist = field.distance(from, to);
    actionable = (unit.status.min_range <= dist && dist <= unit.status.max_range);
    return actionable;
  }

  function actUnit(from, to) {
    const actor = getUnit(from);
    const target = getUnit(to);
    const { units } = currentState;
    const newUnits = Array.from(units);

    const actorIndex = units.indexOf(actor);
    actor.setActed(true);

    if (target) {
      const targetIndex = units.indexOf(target);
      target.actBy(actor);
      if (
        !actor.klass.healer
        && !target.klass.healer
        && checkActionable(target, to, from)
      ) {
        actor.actBy(target);
      }
      newUnits[targetIndex] = target;
    }
    newUnits[actorIndex] = actor;
    currentState = {
      ...currentState,
      units: newUnits,
    };
  }

  function mightChangeTurn() {
    if (shouldEndTurn()) {
      changeTurn();
    }
  }

  function shouldEndTurn() {
    let ended = true;
    const { units, turn } = currentState;
    units.filter(unit => {
      return unit.isAlive();
    }).forEach(unit => {
      if (turn == unit.isOffense) {
        ended = unit.getState().isActed && ended;
      }
    });
    return ended;
  }

  function changeTurn() {
    const { turn, turnCount } = currentState;
    resetUnitsActed();
    currentState = {
      ...currentState,
      turn: !turn,
      turnCount: turnCount+1,
    };
    mightEndGame();
  }

  function resetUnitsActed() {
    currentState = {
      ...currentState,
      units: Array.from(currentState.units.map(unit => {
        unit.setActed(false);
        return unit;
      }))
    };
  }

  function mightEndGame() {
    const { units } = currentState;
    const flags = units.filter(unit => unit.isAlive())
      .map(unit => unit.isOffense)
      .filter((x, i, self) => self.indexOf(x) === i);

    // Annihilation victory
    if (flags.length == 1) {
      currentState = {
        ...currentState,
        isEnd: true,
        winner: flags[0],
      };
      return;
    }

    // Occupation victory
    let occupied = false;
    field.info.base.forEach(basePoint => {
      const unit = getUnit(basePoint);
      if (unit && unit.isOffense) {
        occupied = true;
      }
    });
    if (occupied) {
      currentState = {
        ...currentState,
        isEnd: true,
        winner: true,
      };
    }

    // Defence victory
    if (currentState.turnCount >= defenceTurn*2) {
      currentState = {
        ...currentState,
        isEnd: true,
        winner: false,
      };
    }
  }

  function fixAction(from, to, target) {
    moveUnit(from, to);
    actUnit(to, target);
    mightChangeTurn();
    mightEndGame();
  }


  return {
    cost,
    field,

    getState,
    toData,
    initUnits,
    turnRemained,
    getUnit,
    ownedUnits,
    checkMovable,
    moveUnit,
    checkActionable,
    actUnit,
    changeTurn,
    fixAction,
  };

};
