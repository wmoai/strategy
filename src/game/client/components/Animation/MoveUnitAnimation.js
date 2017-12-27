// @flow
import Field from '../../../models/Field.js';

import Animation from './Animation.js';

export default class MoveUnitAnimation {
  container: any;
  route: Array<number>;
  field: Field;
  cellSize: number;
  animations: Array<Animation>;
  processing: ?Animation;


  constructor({ container, route, field, cellSize }: {
    container: any,
    route: Array<number>,
    field: Field,
    cellSize: number
  }) {
    this.container = container;
    this.route = route;
    this.field = field;
    this.cellSize = cellSize;

    const first = route.shift();
    const firstC = field.coordinates(first);
    let cx = firstC.x * cellSize;
    let cy = firstC.y * cellSize;
    this.animations = route.map(cellId => {
      const sx = cx;
      const sy = cy;
      const nextC = field.coordinates(cellId);
      cx = nextC.x * cellSize;
      cy = nextC.y * cellSize;
      const start = {x: sx, y: sy};
      const end = { x: cx, y: cy};
      return new Animation({
        container,
        start,
        end,
        duration: 4
      });
    });
    this.processing = null;
  }

  isEnd(): boolean {
    const { processing, animations } = this;
    if (processing && processing.isEnd()) {
      this.processing = null;
    }
    if (!processing) {
      if (animations.length == 0) {
        return true;
      }
      this.processing = animations.shift();
    }
    return false;
  }

  update(delta: number) {
    if (this.isEnd()) {
      return;
    }
    if (this.processing) {
      this.processing.update(delta);
    }
  }

}
