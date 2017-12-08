import { Record } from 'immutable';

const TYPE = {
  MOVE: Symbol(),
  ATTACK: Symbol(),
  HEAL: Symbol()
};

export default class Action extends Record({
  unit: null,
  type: null,
  options: {}
}) {

  static createMove(unit, route) {
    return new Action({
      unit: unit,
      type: TYPE.MOVE,
      options: {
        unit: unit,
        route: route
      }
    });
  }


}

