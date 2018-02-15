// @flow

import Animation from './Animation.js';
import UnitComponent from '../Unit.js';

export default class ChangeHP extends Animation {
  container: any;
  unit: UnitComponent;
  beforeWidth: number;
  afterWidth: number;

  constructor({ unit, width }: {
    unit: UnitComponent,
    width: number,
  }) {
    super({ 
      container: unit.container,
      duration: 20
    });
    this.unit = unit;
    this.beforeWidth = unit.greenLine.width;
    this.afterWidth = width;
    this.wait = 20;
  }

  update(delta: number) {
    super.update(delta);
    const { unit, beforeWidth, afterWidth, duration } = this;
    if (this.isEnd) {
      unit.greenLine.width = afterWidth;
    } else {
      const r = this.elapsed / duration;
      unit.greenLine.width = beforeWidth + (afterWidth - beforeWidth) * r;
    }
  }

}
