// @flow

export default class Updater {
  isStarted: boolean;
  wait: number;
  waited: number;
  duration: number;
  before: ?void => void;
  process: (delta: number) => void;
  elapsed: number;
  after: ?void => void;
  isEnd: boolean;

  constructor(duration: number, process?: (delta: number) => void) {
    this.isStarted = false;
    this.duration = duration;
    if (process) {
      this.process = process;
    }
    this.wait = 0;
    this.waited = 0;
    this.elapsed = 0;
    this.isEnd = false;
  }

  update(delta: number) {
    if (this.isEnd) {
      return;
    }
    if (this.wait > this.waited) {
      this.waited += delta;
      return;
    }
    if (this.isStarted) {
      if (this.elapsed >= this.duration) {
        this.isEnd = true;
        if (this.after) {
          this.after();
        }
        return;
      }
      this.process(delta);
    } else {
      this.isStarted = true;
      if (this.before) {
        this.before();
      }
      this.process(delta);
    }
    this.elapsed += delta;
  }

  finish() {
    this.isEnd = true;
  }

}
