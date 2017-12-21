import { Record } from 'immutable';

import Room from '../../../game/models/Room.js';
import UI from './UI.js';
import Ranges from './Ranges.js';

export default class State extends Record({
  socket: null,
  userId: null,
  deck: null,

  room: null,
  isReady: false,

  me: null,
  opponent: null,
  ui: new UI(),
}) {

  connectSocket(socket) {
    return this.set('socket', socket);
  }

  enterRoom(userId) {
    return this.set('userId', userId);
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
    const { socket, room } = this;
    if (socket && room) {
      socket.emit('leaveRoom', room.id);
      socket.close();
    }
    return this.withMutations(mnt => {
      mnt.delete('room')
        .delete('socket')
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

  getBattleReady() {
    return this.set('isReady', true);
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
    return this.set('ui', ui.forecast(cellId, game));
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
    } else if (me.isOffense != game.turn) {
      return this.clearUI();
    } else if (ui.forcusedUnit && ui.forcusedUnit.isOffense == game.turn) {
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
      return !opponent.isHuman;
    }
    return false;
  }

  startSoloPlay(user) {
    // return this.setRoom(Room.soloRoom(user.id, user.deck));
    return this.withMutations(mnt => {
      mnt.set('userId', user.id)
        .setRoom(Room.soloRoom(user.id, user.deck));
    });
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

  getActionByAI() {
    const { room } = this;
    const com = room.opponent(this.userId);
    const { game } = room;
    const units = game.ownedUnits(com.isOffense).filter(unit => !unit.isActed);

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
          return target && target.isOffense !== unit.isOffense;
        } else {
          return target && target.isOffense === unit.isOffense && target.accumulatedDamage() !== 0;
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
    const units = game.ownedUnits(com.isOffense).filter(unit => !unit.isActed);
    const enemies = game.ownedUnits(!com.isOffense);

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
    const units = game.ownedUnits(com.isOffense).filter(unit => !unit.isActed);
    const enemies = game.ownedUnits(!com.isOffense);

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
