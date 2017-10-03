
import { Record, Map as IMMap } from 'immutable';
const STATE = IMMap({
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
  movables: null,
  actionables: null
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
    return this.set('hoveredCell', cellId);
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
        .setState('ACT');
    });
  }

  act() {
    return this.setState('EMITED');
  }

  setRange(game) {
    const cellId = this.movedCell || this.forcusedCell;
    const unit = this.forcusedUnit;
    const { field } = game;

    if (this.stateIs('FREE') || !unit || unit.acted) {
      return this.withMutations(mnt => {
        mnt.delete('movables')
          .delete('actionables');
      });
    }
    const movable = new Map();
    const actionable = new Map();

    const status = unit.status();
    const klass = unit.klass();

    const search4 = (y, x, stamina, init) => {
      if (!field.isActiveCell(y, x)) {
        return;
      }
      const ccid = field.cellId(y, x);
      const cost = field.cost(ccid, klass.move);
      if (cost == 0) {
        return;
      }
      const eunit = game.unit(ccid);
      if (eunit && unit.offense != eunit.offense) {
        return;
      }
      if (!init) {
        stamina -= cost;
      }
      if (stamina >= 0) {
        if (!movable.get(ccid) || stamina > movable.get(ccid)) {
          movable.set(ccid, stamina);
          for (let range=status.min_range; range<=status.max_range; range++) {
            const bd = 90 / range;
            for(let i=0; i<360; i+=bd) {
              const ay = y + (range * Math.sin(i * (Math.PI / 180)) | 0);
              const ax = x + (range * Math.cos(i * (Math.PI / 180)) | 0);
              const acid = field.cellId(ay, ax);
              if (field.isActiveCell(ay, ax)) {
                actionable.set(acid, true);
              }
            }
          }
          search4(y-1, x, stamina);
          search4(y+1, x, stamina);
          search4(y, x-1, stamina);
          search4(y, x+1, stamina);
        }
      }
    };
    const [y, x] = field.coordinates(cellId);
    let move = status.move;
    if (this.stateIs('ACT') || this.stateIs('EMITED')) {
      move = 0;
    }
    search4(y, x, move, true);

    return this.withMutations(mnt => {
      mnt.set('movables', Array.from(movable.keys()))
      .set('actionables', Array.from(actionable.keys()));
    });
  }

  clear() {
    return this.withMutations(mnt => {
      mnt.delete('forcusedCell')
        .delete('forcusedUnit')
        .delete('movedCell')
        .delete('actionForecast')
        .delete('movables')
        .delete('actionables')
        .delete('pickedCell')
        .setState('FREE');
    });
  }

}
