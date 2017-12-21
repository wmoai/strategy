import PIXI from '../PIXI.js';
import Component from './Component.js';

import createUnit from './createUnit.js';
import createMoveUnitAnimation from './Animation/createMoveUnitAnimation.js';

export default class Units extends Component {

  constructor({ unitModels, field, cellSize }) {
    super();
    this.field = field;
    this.cellSize = cellSize;
    this.components = new Map();
    this.animations = [];

    this.layer = {
      ranges: new PIXI.Container(),
      units: new PIXI.Container(),
    };
    this.container.addChild(this.layer.ranges);
    this.container.addChild(this.layer.units);


    unitModels.forEach(unitModel => {
      const unit = createUnit(unitModel, field, cellSize);
      this.layer.units.addChild(unit.container);
      this.components.set(unitModel.seq, unit);
    });

    this.buffers = {
      unitModels: null,
      ranges: null,
    };
    this.shouldUpdate = {
      units: false,
      ranges: false,
    };
  }

  setUnitModels(unitModels) {
    this.buffers.unitModels = unitModels;
    this.shouldUpdate.units = true;
  }

  setRanges(ranges) {
    this.buffers.ranges = ranges;
    this.shouldUpdate.ranges = true;
  }

  update(delta) {
    let isUpdated = false;
    if (this.hasAnimation()) {
      const animation = this.animations[0];
      animation.update(delta);
      // this.followUnit(this.animation.container);
      if (animation.isEnd()) {
        this.animations.shift();
      }
      isUpdated = true;
    } else {
      const { shouldUpdate, buffers, cellSize } = this;
      if (shouldUpdate.units) {
        shouldUpdate.units = false;
        const { unitModels } = buffers;
        if (unitModels) {
          unitModels.forEach(unitModel => {
            const unit = this.components.get(unitModel.seq);
            unit.update(unitModel);
          });
        }
        isUpdated = true;
      }
      if (shouldUpdate.ranges) {
        shouldUpdate.ranges =false;
        const { layer } = this;
        const { ranges } = buffers;
        layer.ranges.removeChildren();
        if (ranges) {
          ranges.setGraph(cellSize);
          layer.ranges.addChild(ranges.container);
        }
        isUpdated = true;
      }
    }
    return isUpdated;
  }

  hasAnimation() {
    return this.animations.length > 0;
  }

  unit(seq) {
    return this.components.get(seq);
  }

  animatingUnit() {
    if (!this.hasAnimation()) {
      return;
    }
    return this.animations[0].container;
  }

  setMoveAnimation(unitModel, route) {
    const { field, cellSize } = this;
    const unit = this.components.get(unitModel.seq);
    const animation = createMoveUnitAnimation({
      container: unit.container,
      route,
      field,
      cellSize
    });
    this.animations.push(animation);
  }



}
