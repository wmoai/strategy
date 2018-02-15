// @flow
import Game from './Game.js';
import * as ai from '../lib/ai.js';
import GameModel from '../../models/Game.js';

export default class SoloGame extends Game {

  constructor(args: {
    renderer: any,
    game: GameModel,
    cellSize: number,
    isOffense: boolean,
  }) {
    super(args);
    this.postUpdate = () => {
      return this.mightActAI();
    };
  }

  endMyTurn() {
    if (this.isOffense === this.model.state.turn) {
      this.model.changeTurn();
    }
  }

  act(from: number, to: number, target: ?number) {
    this.reflectRanges(null);
    this.animateChangeHp(this.model.fixAction(from, to, target));
    this.clearUI();
    this.reflectUnits();
  }

  isCOMTurn() {
    if (this.model.state.turn === this.isOffense) {
      return false;
    }
    return true;
  }

  mightActAI() {
    if (!this.isCOMTurn()) {
      return false;
    }

    this.state.clearUI();
    const { model, isOffense } = this;

    const action = ai.getActionByAI(model, isOffense);
    if (action) {
      const { from, to, target, unitModel } = action;
      this.animateMovement(unitModel, from, to);
      this.act(from, to, target);
      return true;
    }
    const movement = ai.getMovementByAI(model, isOffense);
    if (!movement) {
      this.model.changeTurn();
      return true;
    }
    const { from, to, unitModel } = movement;
    if (unitModel && from != null && to != null) {
      this.animateMovement(unitModel, from, to);
    }
    this.act(from, to);
    return true;
  }


}
