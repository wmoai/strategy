// @flow

import Ranges from './Ranges.js';
import * as masterData from '../../data';

import GameModel from '../../models/Game.js';
import UnitModel from '../../models/Unit.js';

type Action = {
  from: number,
  to: number,
  target?: number,
  unitModel: UnitModel,
};

export function getActionByAI(gameModel: GameModel, isOffense: boolean) {
  if (gameModel.state.isEnd) {
    return null;
  }
  const units = gameModel.ownedUnits(!isOffense).filter(unit => !unit.state.isActed);

  let priUnit, priAction;
  units.forEach(unit => {
    const ranges = new Ranges(gameModel, unit);
    ranges.calculate(unit.state.cellId);
    // 行動対象セル抽出
    const targetCellIds = ranges.getActionables().filter(acell => {
      const target = gameModel.getUnit(acell);
      if (target === unit) {
        return;
      }
      if (!unit.klass.healer) {
        return target && target.isOffense !== unit.isOffense;
      } else {
        return target && target.isOffense === unit.isOffense && target.accumulatedDamage() !== 0;
      }
    });
    const fromTos = [];
    for (let to of targetCellIds) {
      const froms = ranges.getState(to).actionableFrom;
      let from;
      // 空のfromセルを抽出
      froms.forEach(_from => {
        const funit = gameModel.getUnit(_from);
        if (funit == null || funit === unit) {
          from = _from;
        }
      });
      if (from) {
        fromTos.push({ from, to });
      }
    }
    const { field } = gameModel;
    // 行動パラメータを算出
    const actions = fromTos.map(({ from, to }) => {
      let value = 0;
      const target = gameModel.getUnit(to);
      if (target) {
        // 行動評価値 : 行動期待値の対象影響割合
        // FIXME 地形を加味した評価値
        value = target.expectedEvaluationBy(unit, field.distance(from, to), masterData.getTerrain(field.cellTerrainId(to))) / target.state.hp;
      }
      return {
        from,
        to,
        value,
        ranges,
      };
    }).filter(actionCell => {
      return actionCell.from != undefined;
    });

    if (actions.length > 0) {
      // 最大評価値の行動抽出
      const action = actions.reduce((pre, cur) => {
        return pre.value < cur.value ? cur : pre;
      });
      if (!priAction || priAction.value < action.value) {
        priAction = action;
        priUnit = unit;
      }
    }
  });

  if (!priUnit || !priAction) {
    return null;
  }
  // 行動確定
  return {
    from: priUnit.state.cellId,
    to: priAction.from,
    target: priAction.to,
    unitModel: priUnit,
  };
}

export function getMovementByAI(gameModel: GameModel, isOffense: boolean): ?Action {
  const units = gameModel.ownedUnits(!isOffense).filter(unit => !unit.state.isActed);

  if (units.length == 0) {
    return null;
  }
  const unit = units[0];
  const unitState = unit.state;

  const targets = unit.klass.healer
    ? gameModel.ownedUnits(!isOffense).filter(target => target != unit)
    : gameModel.ownedUnits(isOffense);

  const ranges = new Ranges(gameModel, unit);
  ranges.calculate(unitState.cellId, true);

  let shortestD = Infinity;
  let goal;
  // 最短ターゲット探索
  targets.forEach(enemy => {
    const enemyState = enemy.state;
    const d = ranges.getState(enemyState.cellId).distance;
    if (d < shortestD) {
      shortestD = d;
      goal = enemyState.cellId;
    }
  });
  if (!goal) {
    return null;
  }
  const route = ranges.getRoute(goal).reverse();
  for (let i=0; i<route.length; i++) {
    const target = route[i];
    const thatUnit = gameModel.getUnit(target);
    if (ranges.getState(target).isMovable && (!thatUnit || thatUnit == unit)) {
      return {
        from: unitState.cellId,
        to: target,
        unitModel: unit,
      };
    }
  }
}

