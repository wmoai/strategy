// @flow

type Point = {
  x: number,
  y: number,
};

export default class Animation {
  container: any;
  point: Point;
  start: Point;
  end: Point;
  duration: number;
  elapsed: number;
  
  constructor({ container, start, end, duration }: {
    container: any;
    start: Point;
    end: Point;
    duration: number;
  }) {
    this.container = container;
    this.point = {
      x: start.x,
      y: start.y,
    };
    this.start = start;
    this.end = end;

    this.duration = duration;
    this.elapsed = 0;
  }

  isEnd(): boolean {
    return this.elapsed >= this.duration;
  }

  update(delta: number) {
    const { point, start, end, elapsed, duration, container } = this;
    this.elapsed += delta;
    if (this.isEnd()) {
      if (point.x !== null) {
        point.x = end.x;
      }
      if (point.y !== null) {
        point.y = end.y;
      }
    } else {
      const r = elapsed / duration;
      if (point.x !== null) {
        point.x = start.x + (end.x - start.x) * r;
      }
      if (point.y !== null) {
        point.y = start.y + (end.y - start.y) * r;
      }
    }

    container.x = point.x;
    container.y = point.y;
  }

  omit() {
    const { end, container } = this;
    container.x = end.x;
    container.y = end.y;
  }

}
