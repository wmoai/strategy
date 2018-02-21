// @flow

import Player from './Player.js';

export default class COM extends Player {

  constructor() {
    super();
    this.id = 'COM';
    this.isHuman = false;
    this.deck = [1,2,2,27,18,18];
    this.isReady = true;
  }
}
