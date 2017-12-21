export default class Animation {

  constructor(start, end, duration) {
    this.start = start;
    this.end = end;

    this.x = start.x !== null && end.x !== null ? start.x : null;
    this.y = start.y !== null && end.y !== null ? start.y : null;
    this.scale = start.scale;

    this.duration = duration;
    this.elapsed = 0;
    this.isEnd = false;
  }

  update(delta) {
    this.elapsed += delta;
    if (this.elapsed >= this.duration) {
      if (this.x !== null) {
        this.x = this.end.x;
      }
      if (this.y !== null) {
        this.y = this.end.y;
      }
      this.isEnd = true;
      return;
    }

    const r = this.elapsed / this.duration;
    if (this.x !== null) {
      this.x = this.start.x + (this.end.x - this.start.x) * r;
    }
    if (this.y !== null) {
      this.y = this.start.y + (this.end.y - this.start.y) * r;
    }
  }

}
