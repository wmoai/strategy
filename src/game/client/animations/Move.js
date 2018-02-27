// @flow
import Animation from './Animation.js';

type Point = {
  x: number,
  y: number,
};

export default class Move extends Animation {
  start: Point;
  end: Point;
  
  constructor({ container, duration, start, end }: {
    container: any,
    duration: number,
    start: Point,
    end: Point,
  }) {
    super({ container, duration });
    this.start = start;
    this.end = end;
  }

  animate(delta: number) { // eslint-disable-line
    const { container, start, end, duration } = this;
    if (this.isEnd) {
      this.omit();
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
  }

}
