import { Record } from 'immutable';
const STATE = {
  FREE: 1,
  MOVE: 2,
  ACT: 3,
  EMITED: 4
};

export default class UIEntity extends Record({
  _state: STATE['FREE'],
  hoveredUnit: null,
  forcusedCell: null,
  forcusedUnit: null,
  movedCell: null,
  battleForecast: null,
  mask: {}
}) {
  setState(str) {
    return this.set('_state', STATE[str]);
  }

  stateIs(str) {
    return this._state == STATE[str];
  }

  forcusUnit(game, cellId) {
    const unit = game.map.unit(cellId);
    if (!unit || unit.acted) {
      return this.clear();
    }
    return this.withMutations(mnt => {
      mnt
        .set('mask', game.map.movingMap(cellId))
        .set('forcusedCell', cellId)
        .set('forcusedUnit', unit)
        .setState('MOVE');
    });
  }

  moveUnit(game, pnum, unit, fromCellId, toCellId) {
    const tunit = game.map.unit(toCellId);
    if (game.phase != pnum || (fromCellId != toCellId && tunit)) {
      this.forcusUnit(toCellId);
    } else if (unit && unit.pnum == pnum) {
      if (game.map.moveUnit(fromCellId, toCellId)) {
        return this.withMutations(mnt => {
          mnt.set('mask', game.map.movingMap(toCellId, true))
            .set('movedCell', toCellId)
            .setState('ACT');
        });
      } else {
        return this.clear();
      }
    } else {
      return this.clear();
    }
  }

  clear() {
    return new UIEntity();
  }

}


