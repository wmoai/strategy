// @flow

import Updater from '../lib/Updater.js';

export default class Animation extends Updater {
  container: any;

  constructor({ container, duration }: {
    container: any,
    duration: number,
  }) {
    super(duration);
    this.container = container;
    this.process = delta => {
      this.animate(delta);
    };
  }

  animate(delta: number) {
    throw delta;
  }

 
}
