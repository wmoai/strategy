
import Animation from './Animation.js';

export default class MoveUnitAnimation {

  constructor(container, route, field, cellSize, callback) {
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
      const ex = nextC.x * cellSize;
      const ey = nextC.y * cellSize;
      cx = ex;
      cy = ey;
      return new Animation({
        sx,
        sy,
        ex,
        ey,
        duration: 4,
      });
    });
    this.processing = null;
    this.isEnd = false;
    this.callback = callback;
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
    if (this.callback && typeof this.callback === 'function') {
      this.callback();
    }
    this.isEnd = true;
    this.processing = null;
    this.animations = [];
  }

}
