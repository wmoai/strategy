import PIXI from '../PIXI.js';

import createUnit from './createUnit.js';
import createMoveUnitAnimation from './Animation/createMoveUnitAnimation.js';


export default ({ unitModels, field, cellSize }) => {
  const unitsMap = new Map();

  const container =  new PIXI.Container();

  const rangesLayer = new PIXI.Container();
  const unitsLayer = new PIXI.Container();
  container.addChild(rangesLayer);
  container.addChild(unitsLayer);


  unitModels.forEach(unitModel => {
    const unit = createUnit(unitModel, field, cellSize);
    unitsLayer.addChild(unit.container);
    unitsMap.set(unitModel.getState().seq, unit);
  });

  let currentUnitModels;
  let currentRnages;

  function update(delta, unitModels, ranges, animation) {
    if (updateAnimation(delta, animation)) {
      return true;
    } else {
      let isUpdated = false;
      if (currentUnitModels !== unitModels) {
        currentUnitModels = unitModels;
        updateUnits(unitModels);
        isUpdated = true;
      }
      if (currentRnages !== ranges) {
        currentRnages = ranges;
        updateRnages(ranges);
        isUpdated = true;
      }
      return isUpdated;
    }

  }

  function updateAnimation(delta, animation) {
    if (!animation || animation.isEnd()) {
      return false;
    }
    animation.update(delta);
    return true;
  }

  function updateUnits(unitModels) {
    unitModels.forEach(unitModel => {
      const unit = unitsMap.get(unitModel.getState().seq);
      unit.update(unitModel);
    });
  }

  function updateRnages(ranges) {
    rangesLayer.removeChildren();
    if (ranges) {
      rangesLayer.addChild(ranges.getContainer(cellSize));
    }
  }

  function createMoveAnimation(unitModel, route) {
    const unit = unitsMap.get(unitModel.getState().seq);
    return createMoveUnitAnimation({
      container: unit.container,
      route,
      field,
      cellSize
    });
  }

  function unit(seq) {
    return unitsMap.get(seq);
  }


  return {
    update,
    createMoveAnimation,
    container,
    unit,
  };

};
