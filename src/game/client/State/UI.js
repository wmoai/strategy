
import { Record, Map } from 'immutable';
import Ranges from './Ranges.js';
import Action from './Action.js';

const STATE = Map({
  FREE: Symbol(),
  MOVE: Symbol(),
  ACT: Symbol(),
  EMITED: Symbol()
});

export default class UI extends Record({
  _state: STATE.get('FREE'),
  pickedCell: null,
  hoveredCell: null,
  hoveredUnit: null,
  forcusedCell: null,
  forcusedUnit: null,
  movedCell: null,
  actionForecast: null,

  ranges: null,
  action: null,
}) {

  stateIs(str) {
    return this._state == STATE.get(str);
  }

  setState(str) {
    const state = STATE.get(str);
    if (state) {
      return this.set('_state', state);
    }
    return this;
  }

  pickToChange(cellId) {
    return this.withMutations(mnt => {
      mnt.set('pickedCell', cellId).setState('MOVE');
    });
  }

  putToChange() {
    return this.withMutations(mnt => {
      mnt.delete('pickedCell').setState('FREE');
    });
  }

  hoverCell(cellId) {
    return this.withMutations(mnt => {
      mnt.set('hoveredCell', cellId)
        .delete('actionForecast');
    });
  }

  hoverUnit(unit) {
    if (!unit) {
      return this.delete('hoveredUnit');
    }
    return this.withMutations(mnt => {
      mnt.set('hoveredUnit', unit)
      .delete('actionForecast');
    });
  }

  forcus(unit) {
    if (!unit) {
      return this;
    }
    return this.withMutations(mnt => {
      mnt.set('forcusedUnit', unit)
        .set('forcusedCell', unit.cellId)
        .setState('MOVE');
    });
  }

  move(cellId) {
    return this.withMutations(mnt => {
      mnt.set('movedCell', cellId)
        .setMoveAction(mnt.forcusedUnit, mnt.ranges.getMoveRoute(cellId))
        .setState('ACT');
    });
  }

  setMoveAction(unit, route) {
    return this.set('action',  Action.createMove(unit, route));
  }

  act() {
    return this.setState('EMITED');
  }

  setMoveRange(game) {
    const cellId = this.movedCell || this.forcusedCell;
    const unit = this.forcusedUnit;
    if (this.stateIs('FREE') || !unit || unit.acted) {
      return this.delete('ranges');
    }
    const ranges = Ranges.calculate(game, cellId, unit);
    return this.set('ranges', ranges);
  }

  setActRange(game) {
    const cellId = this.movedCell || this.forcusedCell;
    const unit = this.forcusedUnit;

    const ranges = new Ranges(game);
    ranges.setMovable(unit, cellId);
    return this.set('ranges', ranges);
  }

  clear() {
    return this.withMutations(mnt => {
      mnt.delete('forcusedCell')
        .delete('forcusedUnit')
        .delete('movedCell')
        .delete('actionForecast')
        .delete('ranges')
        .delete('action')
        .delete('pickedCell')
        .setState('FREE');
    });
  }

}
