// @flow

export default class Animation {
  container: any;
  duration: number;
  wait: number;
  waited: number;
  elapsed: number;
  isStarted: boolean;
  isEnd: boolean;

  constructor({ container, duration }: {
    container: any,
    duration: number,
  }) {
    this.container = container;
    this.duration = duration;
    this.elapsed = 0;
    this.isStarted = false;
    this.isEnd = false;
    this.wait = 0;
    this.waited = 0;
  }

  update(delta: number) {
    this.isStarted = true;
    this.waited += delta;
    if (this.waited < this.wait) {
      return;
    }
    this.elapsed += delta;
    this.isEnd = this.elapsed >= this.duration;
  }
  
}
