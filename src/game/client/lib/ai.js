import createRanges from '../components/createRanges.js';

export function getActionByAI(gameModel, isOffense) {
  if (gameModel.isEnd) {
    return null;
  }
  const units = gameModel.ownedUnits(!isOffense).filter(unit => !unit.getState().isActed);

  let priUnit, priAction;
  units.forEach(unit => {
    const ranges = createRanges(gameModel, unit);
    ranges.calculate(unit.cellId);
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
    // 行動パラメータを算出
    const actions = targetCellIds.map(tcell => {
      const froms = ranges.getActionableFrom(tcell);
      let from;
      // 空のfromセルを抽出
      // FIXME 地形を加味した評価値
      froms.forEach(_from => {
        const funit = gameModel.getUnit(_from);
        if (funit == null || funit === unit) {
          from = _from;
        }
      });
      const target = gameModel.getUnit(tcell);
      return {
        from,
        to: tcell,
        value: (
          // 行動評価値
          from != undefined
          ? target.expectedEvaluationBy(unit, gameModel.field.avoidance(target.cellId))
          : null
        ),
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
    from: priUnit.cellId,
    to: priAction.from,
    target: priAction.to,
    unitModel: priUnit,
    route: priAction.ranges.getRoute(priAction.from),
  };
}

export function getMovementByAI(gameModel, isOffense) {
  const units = gameModel.ownedUnits(!isOffense).filter(unit => !unit.getState().isActed);

  if (units.length == 0) {
    return null;
  }
  const unit = units[0];
  const unitState = unit.getState();

  const targets = unit.klass.healer
    ? gameModel.ownedUnits(!isOffense).filter(target => target != unit)
    : gameModel.ownedUnits(isOffense);

  const ranges = createRanges(gameModel, unit);
  ranges.calculate(unitState.cellId, true);

  let shortestD = Infinity;
  let goal;
  // 最短ターゲット探索
  targets.forEach(enemy => {
    const enemyState = enemy.getState();
    const d = ranges.getDistance(enemyState.cellId);
    if (d < shortestD) {
      shortestD = d;
      goal = enemyState.cellId;
    }
  });
  if (!goal) {
    return {
      from: unitState.cellId,
      to: unitState.cellId,
    };
  }
  const route = ranges.getRoute(goal).reverse();
  for (let i=0; i<route.length; i++) {
    const target = route[i];
    if (ranges.isMovable(target) && !gameModel.getUnit(target)) {
      return {
        from: unitState.cellId,
        to: target,
        unitModel: unit,
        route: ranges.getRoute(target),
      };
    }
  }
}



