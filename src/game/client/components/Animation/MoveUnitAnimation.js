
import Animation from './Animation.js';

export default class MoveUnitAnimation {

  constructor(container, route, field, cellSize) {
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
      return new Animation({
        x: sx,
        y: sy,
      }, {
        x: cx,
        y: cy
      }, 4);
    });
    this.processing = null;
    this.isEnd = false;
  }

  update(delta) {
    if (!this.processing) {
      if (this.animations.length == 0) {
        this.end();
        return;
      }
      this.processing = this.animations.shift();
    }
    this.processing.update(delta);
    this.container.x = this.processing.x;
    this.container.y = this.processing.y;
    if (this.processing.isEnd) {
      this.processing = null;
    }
  }

  omit() {
    let animation = this.animations.length == 0 ? this.processing : this.animations.pop();
    if (!animation) {
      return;
    }
    this.container.x = animation.ex;
    this.container.y = animation.ey;
    this.end();
  }

  end() {
    if (this.bufferUnit) {
      this.update(this.bufferUnit);
    }
    this.isEnd = true;
    this.processing = null;
    this.animations = [];
  }

}
