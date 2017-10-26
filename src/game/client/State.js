import { Record } from 'immutable';

import Room from '../models/Room.js';
import Game from '../models/Game.js';
import UI from './UI.js';

export default class State extends Record({
  userId: null,
  room: null,
  me: null,
  opponent: null,
  ui: new UI(),
}) {

  init(userId) {
    return this.set('userId', userId);
  }

  syncRoom(data) {
    const room = Room.restore(data);
    return this.withMutations(mnt => {
      mnt.set('room', room)
        .set('me', room.player(mnt.userId))
        .set('opponent', room.opponent(mnt.userId));
    });
  }

  leaveRoom() {
    return this.withMutations(mnt => {
      mnt.delete('room')
        .delete('ui');
    });
  }

  syncGame(data) {
    return this.withMutations(mnt => {
      mnt.set('room', mnt.room.set('game', Game.restore(data)))
        .set('ui', mnt.ui.clear());
    });
  }

  returnRoom() {
    return this.withMutations(mnt => {
      mnt.set('room', mnt.room.delete('game'))
        .delete('ui');
    });
  }

  hoverCell(cellId) {
    const { room, ui } = this;
    const { game } = room;
    if (game.isEnd) {
      return this;
    }
    if (ui.stateIs('ACT')
      && game.checkActionable(ui.forcusedUnit, ui.movedCell, cellId)) {
      return this.forecastAction(cellId);
    } else {
      const unit = game.unit(cellId);
      return this.set('ui', ui.withMutations(mnt => {
        mnt.hoverCell(cellId).hoverUnit(unit);
      }));
    }
  }

  forecastAction(cellId) {
    const { room, ui } = this;
    const { game } = room;
    const unit = ui.forcusedUnit;
    const target = game.unit(cellId);
    if (!ui.stateIs('ACT') || !unit || !target) {
      return this;
    }
    const result = {
      me: {
        name: unit.status().name,
        hp: unit.hp,
        offense: unit.offense
      },
      tg: {
        name: target.status().name,
        hp: target.hp,
        offense: target.offense
      }
    };
    if (unit.klass().healer) {
      result.me.val = unit.status().pow;
    } else {
      result.me.val = target.effectValueBy(unit);
      result.me.hit = target.hitRateBy(unit, game.field.avoidance(cellId));
      result.me.crit = target.critRateBy(unit);
    }
    if (!unit.klass().healer && !target.klass().healer) {
      // counter attack
      if (game.checkActionable(target, cellId, ui.movedCell)) {
        result.tg.val = unit.effectValueBy(target);
        result.tg.hit = unit.hitRateBy(target, game.field.avoidance(ui.movedCell));
        result.tg.crit = unit.critRateBy(target);
      }
    }
    return this.set('ui', ui.set('actionForecast', result));
  }

  selectCell(cellId, onAct) {
    const { room, ui } = this;
    const { game } = room;
    if (game.isEnd) {
      return this;
    }
    if (ui.stateIs('FREE')) {
      return this.forcus(cellId);
    } else if (ui.stateIs('MOVE')) {
      return this.mightMove(cellId);
    } else if (ui.stateIs('ACT')) {
      return this.mightAct(cellId, onAct);
    }
    return this;
  }

  forcus(cellId) {
    const { room, ui } = this;
    const { game } = room;
    return this.set('ui', ui.forcus(game.unit(cellId)).setRange(game));
  }

  mightMove(cellId) {
    const { room, me, ui } = this;
    const { game } = room;
    const newUnit = game.unit(cellId);
    if (newUnit && newUnit != ui.forcusedUnit) {
      return this.forcus(cellId);
    } else if (me.offense != game.turn) {
      return this.clearUI();
    } else if (ui.forcusedUnit && ui.forcusedUnit.offense == game.turn) {
      if (game.checkMovable(ui.forcusedCell, cellId)) {
        return this.withMutations(mnt => {
          mnt.set('room', mnt.room.set('game', game.moveUnit(ui.forcusedCell, cellId)))
            .set('ui', ui.move(cellId).setRange(game));
        });
      } else {
        return this.clearUI();
      }
    }
    return this.clearUI();

  }

  undo() {
    const { room, ui } = this;
    const { game } = room;
    return this.set('room', room.set('game', game.moveUnit(ui.movedCell, ui.forcusedCell)));
  }

  clearUI() {
    const { ui } = this;
    return this.set('ui', ui.clear());
  }

  mightAct(cellId, onAct) {
    const { ui } = this;
    if (this.canAct(cellId)) {
      const actCell = (cellId != ui.movedCell) ? cellId : undefined;
      setImmediate(() => {
        onAct(ui.forcusedCell, ui.movedCell, actCell);
      });
      return this.set('ui', ui.act());
    }
    return this.undo().clearUI();
  }

  canAct(cellId) {
    const { room, ui } = this;
    const { game } = room;
    return cellId == ui.movedCell
      || game.checkActionable(ui.forcusedUnit, ui.movedCell, cellId);
  }
}
