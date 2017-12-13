import Ranges from '../Ranges.js';

export function getActionByAI(model, isOffense) {
  if (model.isEnd) {
    return null;
  }
  const units = model.ownedUnits(!isOffense).filter(unit => !unit.acted);

  let priUnit, priAction;
  units.forEach(unit => {
    const ranges = new Ranges(model);
    ranges.calculate(unit.cellId, unit);
    // 行動対象セル抽出
    const targetCellIds = ranges.getActionables().filter(acell => {
      const target = model.unit(acell);
      if (target === unit) {
        return;
      }
      if (!unit.klass.healer) {
        return target && target.offense !== unit.offense;
      } else {
        return target && target.offense === unit.offense && target.accumulatedDamage() !== 0;
      }
    });
    // 行動パラメータを算出
    const actions = targetCellIds.map(tcell => {
      const froms = ranges.getActionableFrom(tcell);
      let from;
      // 空のfromセルを抽出
      // FIXME 地形を加味した評価値
      froms.forEach(_from => {
        const funit = model.unit(_from);
        if (funit == null || funit === unit) {
          from = _from;
        }
      });
      const target = model.unit(tcell);
      return {
        from,
        to: tcell,
        value: (
          // 行動評価値
          from != undefined
          ? target.expectedEvaluationBy(unit, model.field.avoidance(target.cellId))
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
    route: priAction.ranges.getMoveRoute(priAction.from),
  };
}

export function getMovementByAI(model, isOffense) {
  const units = model.ownedUnits(!isOffense).filter(unit => !unit.acted);
  const enemies = model.ownedUnits(isOffense);

  if (units.count() == 0) {
    return null;
  }
  const unit = units.first();

  const ranges = new Ranges(model);
  ranges.calculate(unit.cellId, unit, true);

  let shortestD = Infinity;
  let goal;
  // 最短ターゲット探索
  enemies.forEach(enemy => {
    const d = ranges.getDistance(enemy.cellId);
    if (d < shortestD) {
      shortestD = d;
      goal = enemy.cellId;
    }
  });
  if (!goal) {
    return {
      from: unit.cellId,
      to: unit.cellId,
    };
  }
  const route = ranges.getMoveRoute(goal).reverse();
  for (let i=0; i<route.length; i++) {
    const target = route[i];
    if (ranges.info(target).isMovable && !model.unit(target)) {
      return {
        from: unit.cellId,
        to: target,
        unitModel: unit,
        route: ranges.getMoveRoute(target),
      };
    }
  }
}



