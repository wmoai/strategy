import { Record } from 'immutable';

import Room from '../models/Room.js';
import UI from './UI.js';

export default class State extends Record({
  userId: null,
  deck: null,
  room: null,
  me: null,
  opponent: null,
  ui: new UI(),
}) {

  init({ userId, deck }) {
    return this.withMutations(mnt => {
      mnt.set('userId', userId)
        .set('deck', deck);
    });
  }

  syncRoom(data) {
    const room = Room.restore(data);
    return this.setRoom(room);
  }

  setRoom(room) {
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
      mnt.set('room', mnt.room.syncGame(data))
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
        name: unit.status.name,
        hp: unit.hp,
        offense: unit.offense
      },
      tg: {
        name: target.status.name,
        hp: target.hp,
        offense: target.offense
      }
    };
    if (unit.klass.healer) {
      result.me.val = unit.status.pow;
    } else {
      result.me.val = target.effectValueBy(unit);
      result.me.hit = target.hitRateBy(unit, game.field.avoidance(cellId));
      result.me.crit = target.critRateBy(unit);
    }
    if (!unit.klass.healer && !target.klass.healer) {
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
        if (onAct && typeof onAct === 'function') {
          onAct(ui.forcusedCell, ui.movedCell, actCell);
        }
      });
      return this.withMutations(mnt => {
        mnt.set('ui', ui.act());
        if (mnt.room.isSolo) {
          mnt.set('room', mnt.room.actInGame(mnt.userId, ui.forcusedCell, ui.movedCell, actCell))
            .clearUI();
        }
      });
    }
    return this.undo().clearUI();
  }

  canAct(cellId) {
    const { room, ui } = this;
    const { game } = room;
    return cellId == ui.movedCell
      || game.checkActionable(ui.forcusedUnit, ui.movedCell, cellId);
  }



  isSolo() {
    return this.room != null && this.room.isSolo;
  }

  isCOMTurn() {
    return !this.room.isTrunPlayer(this.userId);
  }

  startSoloPlay() {
    return this.setRoom(Room.soloRoom(this.userId, this.deck));
  }

  selectUnitSolo(list) {
    return this.setRoom(
      this.room.selectUnits(this.userId, list).mightEngage()
    );
  }

  endTurnSolo() {
    return this.set('room', this.room.endTurn(this.userId));
  }

  mightStartAITurn() {
    if (!this.isCOMTurn()) {
      return this;
    }
    return this.withMutations(mnt => {
      for (let i=0; i<20; i++) {
        if (!mnt.isCOMTurn() || mnt.room.game.isEnd) {
          break;
        }
        mnt.actByAI();
      }
    });
  }

  actByAI() {
    const { room, ui } = this;
    const com = room.opponent(this.userId);
    const { game } = room;
    const units = game.ownedUnits(com.offense).filter(unit => !unit.acted);

    let priUnit, priAction;
    units.forEach(unit => {
      const bufferUi = ui.forcus(unit).setRange(game);
      if (!unit.klass.healer) {
        // 行動対象セル抽出
        const targetCellIds = bufferUi.ranges.getActionables().filter(acell => {
          const target = game.unit(acell);
          return target && target.offense !== unit.offense;
        });
        // 行動パラメータを算出
        const actions = targetCellIds.map(tcell => {
          const froms = bufferUi.ranges.getActionableFrom(tcell);
          let from;
          // 空のfromセルを抽出
          froms.forEach(_from => {
            if (game.unit(_from) == null) {
              from = _from;
            }
          });
          const target = game.unit(tcell);
          return {
            from,
            to: tcell,
            value: (
              // 行動評価値
              from != undefined
              ? target.expectedEvaluationBy(unit, game.field.avoidance(target.cellId))
              : null
            )
          };
        }).filter(actionCell => {
          return actionCell.from != undefined;
        });

        if (actions.length > 0) {
          // 最大評価値の行動抽出
          const action = actions.reduce((pre, cur) => {
            return pre.value < cur.value ? cur : pre;
          });
          if (!priAction || priAction.value < action.value) {
            priAction = action;
            priUnit = unit;
          }
        }
      }
    });
    if (priUnit && priAction) {
      // 行動確定
      return this.set(
        'room',
        this.room.actInGame(com.id, priUnit.cellId, priAction.from, priAction.to)
      );
    } else {
      return this.set('room', this.room.endTurn(com.id));
    }
  }

}
