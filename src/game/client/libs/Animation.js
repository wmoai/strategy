export default class Animation {

  constructor({ sx, sy, ex, ey, duration }) {
    this.sx = sx;
    this.sy = sy;
    this.ex = ex;
    this.ey = ey;
    this.x = sx;
    this.y = sy;
    this.duration = duration;
    this.elapsed = 0;
    this.isEnd = false;
  }

  update(delta) {
    this.elapsed += delta;
    if (this.elapsed >= this.duration) {
      this.x = this.ex;
      this.y = this.ey;
      this.isEnd = true;
      return;
    }

    const r = this.elapsed / this.duration;
    this.x = this.sx + (this.ex - this.sx) * r;
    this.y = this.sy + (this.ey - this.sy) * r;
  }

}
