import { Record } from 'immutable';

import Room from '../../models/Room.js';
import UI from './UI.js';
import Ranges from './Ranges.js';

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
    const { userId } = this;
    return this.withMutations(mnt => {
      mnt.set('room', room)
        .set('me', room.player(userId))
        .set('opponent', room.opponent(userId));
    });
  }

  leaveRoom() {
    return this.withMutations(mnt => {
      mnt.delete('room')
        .delete('ui');
    });
  }

  syncGame(gameData, actionData) {
    const room = this.room.syncGame(gameData);
    let ui = this.ui.clear();
    if (actionData && this.room.game) {
      const { game } = this.room;
      const unit = game.unit(actionData.from);
      if (unit) {
        const ranges = Ranges.calculate(game, unit.cellId, unit);
        const route = ranges.getMoveRoute(actionData.to);
        ui = ui.setMoveAction(unit, route);
      }
    }
    return this.withMutations(mnt => {
      mnt.set('room', room)
        .set('ui', ui);
    });
  }

  returnRoom() {
    const room = this.room.delete('game');
    return this.withMutations(mnt => {
      mnt.set('room', room)
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
    return this.set('ui', ui.forcus(game.unit(cellId)).setMoveRange(game));
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
            .set('ui', ui.move(cellId).setActRange(game));
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
    if (this.isActionable(cellId)) {
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

  isActionable(cellId) {
    const { room, ui } = this;
    const { game } = room;
    return cellId == ui.movedCell
      || game.checkActionable(ui.forcusedUnit, ui.movedCell, cellId);
  }



  isSolo() {
    return this.room != null && this.room.isSolo;
  }

  isCOMTurn() {
    if (this.room.isTurnPlayer(this.userId)) {
      return false;
    }
    const opponent = this.room.opponent(this.userId);
    if (opponent) {
      return opponent.isHuman;
    }
    return false;
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

  mightActAI() {
    if (!this.isCOMTurn()) {
      return this;
    }
    const { room } = this;
    const com = room.opponent(this.userId);

    const action = this.getActionByAI();
    if (action) {
      const { userId, from, to, target, unit, route } = action;
      return this.withMutations(mnt => {
        mnt.set('room', mnt.room.actInGame(userId, from, to, target))
          .set('ui', mnt.ui.setMoveAction(unit, route));
      });
    }
    const movement = this.getMovementByAI();
    if (!movement) {
      return this.set('room', room.endTurn(com.id));
    }
    const { userId, from, to, unit, route } = movement;
    return this.withMutations(mnt => {
      mnt.set('room', mnt.room.actInGame(userId, from, to))
        .set('ui', mnt.ui.setMoveAction(unit, route));
    });
  }

  // mightStartAITurn() {
    // if (!this.isCOMTurn()) {
      // return this;
    // }
    // return this.withMutations(mnt => {
      // for (let i=0; i<20; i++) {
        // const action = mnt.getActionByAI();
        // if (!action) {
          // break;
        // }
        // const { userId, from, to, target } = action;
        // mnt.set('room', mnt.room.actInGame(userId, from, to, target));
      // }
      // mnt.moveByAI();
      // if (mnt.isCOMTurn()) {
        // const { room } = mnt;
        // const com = room.opponent(mnt.userId);
        // mnt.set('room', room.endTurn(com.id));
      // }
    // });
  // }

  getActionByAI() {
    const { room } = this;
    const com = room.opponent(this.userId);
    const { game } = room;
    const units = game.ownedUnits(com.offense).filter(unit => !unit.acted);

    if (!this.isCOMTurn() || this.room.game.isEnd) {
      return null;
    }

    let priUnit, priAction;
    units.forEach(unit => {
      const ranges = Ranges.calculate(game, unit.cellId, unit);
      // 行動対象セル抽出
      const targetCellIds = ranges.getActionables().filter(acell => {
        const target = game.unit(acell);
        if (target === unit) {
          return;
        }
        if (!unit.klass.healer) {
          return target && target.offense !== unit.offense;
        } else {
          return target && target.offense === unit.offense && target.accumulatedDamage() !== 0;
        }
      });
      // 行動パラメータを算出
      const actions = targetCellIds.map(tcell => {
        const froms = ranges.getActionableFrom(tcell);
        let from;
        // 空のfromセルを抽出
        // FIXME 地形を加味した評価値
        froms.forEach(_from => {
          const funit = game.unit(_from);
          if (funit == null || funit === unit) {
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
          ),
          ranges,
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
    });

    if (!priUnit || !priAction) {
      return null;
    }
    // 行動確定
    return {
      userId: com.id,
      from: priUnit.cellId,
      to: priAction.from,
      target: priAction.to,
      unit: priUnit,
      route: priAction.ranges.getMoveRoute(priAction.from),
    };
  }

  moveByAI() {
    const { room } = this;
    const com = room.opponent(this.userId);
    const { game } = room;
    const units = game.ownedUnits(com.offense).filter(unit => !unit.acted);
    const enemies = game.ownedUnits(!com.offense);

    return this.withMutations(mnt => {
      units.forEach(unit => {
        const ranges = Ranges.calculate(game, unit.cellId, unit, true);
        let shortestD = Infinity;
        let goal;
        // 最短ターゲット探索
        enemies.forEach(enemy => {
          const d = ranges.getDistance(enemy.cellId);
          if (d < shortestD) {
            shortestD = d;
            goal = enemy.cellId;
          }
        });
        if (!goal) {
          return;
        }
        const route = ranges.getMoveRoute(goal).reverse();
        for (let i=0; i<route.length; i++) {
          const target = route[i];
          if (ranges.cell(target).isMovable && !mnt.room.game.unit(target)) {
            mnt.set('room', mnt.room.actInGame(com.id, unit.cellId, target));
            break;
          }
        }
      });
    });
  }

  getMovementByAI() {
    const { room } = this;
    const com = room.opponent(this.userId);
    const { game } = room;
    const units = game.ownedUnits(com.offense).filter(unit => !unit.acted);
    const enemies = game.ownedUnits(!com.offense);

    if (units.count() == 0) {
      return null;
    }
    const unit = units.first();

    const ranges = Ranges.calculate(game, unit.cellId, unit, true);
    let shortestD = Infinity;
    let goal;
    // 最短ターゲット探索
    enemies.forEach(enemy => {
      const d = ranges.getDistance(enemy.cellId);
      if (d < shortestD) {
        shortestD = d;
        goal = enemy.cellId;
      }
    });
    if (!goal) {
      return {
        userId: com.id,
        from: unit.cellId,
        to: unit.cellId,
        target: null,
      };
    }
    const route = ranges.getMoveRoute(goal).reverse();
    for (let i=0; i<route.length; i++) {
      const target = route[i];
      if (ranges.cell(target).isMovable && !room.game.unit(target)) {
        return {
          userId: com.id,
          from: unit.cellId,
          to: target,
          target: null,
          unit,
          route: ranges.getMoveRoute(target),
        };
      }
    }
  }

}
