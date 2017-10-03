import { Record } from 'immutable';
import UI from './UI.js';

const Game = require('../models/Game.js');

export default class Controller extends Record({
  game: null,
  ui: new UI(),
  offense: undefined,
}) {

  sync({ game }) {
    return this.withMutations(mnt => {
      mnt.set('game', Game.restore(game)).clearUI();
    });
  }

  hoverCell(cellId) {
    const { game, ui } = this;
    if (game.won != undefined) {
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

  selectCell(cellId, actionCallback) {
    const { game, ui } = this;
    if (game.won != undefined) {
      return this;
    }
    if (game.stateIs('BEFORE')) {
      return this.changeCell(cellId);
    } else if (ui.stateIs('FREE')) {
      return this.forcus(cellId);
    } else if (ui.stateIs('MOVE')) {
      return this.tryMove(cellId);
    } else if (ui.stateIs('ACT')) {
      return this.tryAct(cellId, actionCallback);
    }
    return this;
  }

  changeCell(cellId) {
    if (this.ui.stateIs('FREE')) {
      return this.pickToChange(cellId);
    } else if (this.ui.stateIs('MOVE')) {
      return this.putToChange(cellId);
    }
    return this;
  }

  pickToChange(cellId) {
    const unit = this.game.unit(cellId);
    if (unit && unit.offense == this.offense) {
      return this.set('ui', this.ui.pickToChange(cellId));
    }
    return this;
  }

  putToChange(cellId) {
    const initialPos = this.game.field.initialPos(this.offense);
    if (initialPos.includes(cellId)) {
      return this.withMutations(mnt => {
        mnt.set('game', mnt.game.changeUnit(this.ui.pickedCell, cellId))
          .set('ui', mnt.ui.putToChange())
          .hoverCell(cellId);
      });
    }
    return this.clearUI();
  }

  forcus(cellId) {
    const { game, ui } = this;
    return this.set('ui', ui.forcus(game.unit(cellId)).setRange(game));
  }

  tryMove(cellId) {
    const { game, ui } = this;
    const newUnit = game.unit(cellId);
    if (newUnit && newUnit != ui.forcusedUnit) {
      return this.forcus(cellId);
    } else if (this.offense != game.turn) {
      return this.clearUI();
    } else if (ui.forcusedUnit && ui.forcusedUnit.offense == game.turn) {
      if (game.checkMovable(ui.forcusedCell, cellId)) {
        return this.withMutations(mnt => {
          mnt.set('game', mnt.game.moveUnit(mnt.ui.forcusedCell, cellId))
            .set('ui', mnt.ui.move(cellId).setRange(game));
        });
      } else {
        return this.clearUI();
      }
    }
    return this.clearUI();
  }

  tryAct(cellId, actionCallback) {
    const { ui } = this;
    if (this.canAct(cellId)) {
      const actCell = (cellId != ui.movedCell) ? cellId : undefined;
      setTimeout(() => {
        actionCallback(ui.forcusedCell, ui.movedCell, actCell);
      }, 0);
      return this.set('ui', ui.act());
    }
    return this.clearUI(true);
  }

  canAct(cellId) {
    const { game, ui } = this;
    return cellId == ui.movedCell
      || game.checkActionable(ui.forcusedUnit, ui.movedCell, cellId);
  }

  clearUI(undo=false) {
    const { game, ui } = this;
    return this.withMutations(mnt => {
      if (undo) {
        mnt.set('game', game.moveUnit(ui.movedCell, ui.forcusedCell));
      }
      mnt.set('ui', ui.clear());
    });
  }

  forecastAction(cellId) {
    const { game, ui } = this;
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

}
