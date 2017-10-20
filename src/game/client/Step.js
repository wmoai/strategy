import { Record } from 'immutable';

const STEP = {
  LOBBY: Symbol(),
  SELECT: Symbol(),
  GAME: Symbol(),
};

export default class Step extends Record({
  val: STEP.LOBBY
}) {

  is(key) {
    const comparison = STEP[key];
    if (!comparison) {
      throw 'Step not found.';
    }
    return this.val == comparison;
  }

  forward() {
    switch (this.val) {
      case STEP.LOBBY:
        return this.set('val', STEP.SELECT);
      case STEP.SELECT:
        return this.set('val', STEP.GAME);
      case STEP.GAME:
        return this.set('val', STEP.LOBBY);
    }
    return this;
  }

}
