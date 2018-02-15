// @flow
import Animation from './Animation.js';

type Point = {
  x: number,
  y: number,
};

export default class Move extends Animation {
  start: Point;
  end: Point;
  
  constructor({ container, start, end, duration }: {
    container: any;
    start: Point;
    end: Point;
    duration: number;
  }) {
    super({ container, duration });
    this.start = start;
    this.end = end;
  }

  update(delta: number) {
    super.update(delta);
    const { container, start, end, duration } = this;
    if (this.isEnd) {
      container.x = end.x;
      container.y = end.y;
    } else {
      const r = this.elapsed / duration;
      container.x = start.x + (end.x - start.x) * r;
      container.y = start.y + (end.y - start.y) * r;
    }
  }

  omit() {
    const { container, end } = this;
    container.x = end.x;
    container.y = end.y;
    this.isEnd = true;
  }

}
