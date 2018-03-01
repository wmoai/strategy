// @flow

import PIXI from '../PIXI.js';
import Component from './Component.js';

export default class Timer extends Component {
  line: any;
  startedTime: number;
  limitMilliSeconds: number;
  isEnd: boolean;

  constructor() {
    super();
    const line = new PIXI.Graphics();
    line.beginFill(0xdddddd);
    line.drawRect(0, 0, 1, 2);
    this.container.visible = false;

    this.container.addChild(line);
    this.line = line;
    this.isEnd = false;
  }


  restart(ms: number) {
    this.isEnd = false;
    this.container.visible = true;
    this.startedTime = (new Date()).getTime();
    this.limitMilliSeconds = ms;
  }

  stop() {
    this.container.visible = false;
  }

  update(width: number) {
    if (this.isEnd) {
      return;
    }
    const { line, startedTime, limitMilliSeconds } = this;
    const now = (new Date()).getTime();
    const elapsed = now - startedTime;
    line.width = width - (width * elapsed / limitMilliSeconds);
    this.isEnd = elapsed > limitMilliSeconds;
  }

}
