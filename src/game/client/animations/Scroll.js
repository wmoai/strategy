// @flow
import Updater from '../lib/Updater.js';
import Game from '../components/Game.js';

export default class Scroll extends Updater {
  game: Game;
  dx: number;
  dy: number;

  constructor(game: Game, dx: number, dy: number) {
    const duration = 10;
    super(duration);
    this.process = delta => {
      game.scroll(dx * delta / duration, dy * delta / duration);
    };
  }

}
