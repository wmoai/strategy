const Game = require('./Game.js');
const unitMaster = require('./data/json/unit.json');

module.exports = class Client {
  constructor(gid, socket) {
    this.game = new Game();
    this.socket = socket;
    socket.emit('join', gid);
    this.pnum = null;
    this.deck = {};

    this.forcusedCell = null;
    this.forcusedUnit = null;
    this.movedCell = null;
    this.mask = {
      movable: {},
      actionbale: {}
    };

    this.state = (function() {
      const STATE = {
        FREE: 1,
        MOVE: 2,
        ACT: 3,
        EMITED: 4
      };
      let state = STATE.FREE;
      return {
        is: function(str) {
          return state == STATE[str];
        },
        set: function(str) {
          state = STATE[str];
        }
      };
    })();
  }

  mirror(data, completedAction=false) {
    this.game = Game.restore(data);
    if (completedAction) {
      this.clearForcus();
      this.state.set('FREE');
    }
    return this;
  }

  setMetaData(data) {
    this.pnum = data.pnum;
    const deck = {
      army: [],
      enemy: []
    };
    Object.keys(data.deck).forEach(pnum => {
      if (pnum == data.pnum) {
        deck.army = this.getPrepUnits(data.deck[pnum]);
      } else {
        deck.enemy = this.getPrepUnits(data.deck[pnum]);
      }
    });
    this.deck = deck;
    return this;
  }

  unit(cellId) {
    return this.game.map.unit(cellId);
  }

  selectCell(cellId) {
    if (!this.game.isRun()) {
      return;
    }

    if (this.state.is('FREE')) {
      this.controlFREE(cellId);
    } else if (this.state.is('MOVE')) {
      this.controlMOVE(cellId);
    } else if (this.state.is('ACT')) {
      this.controlACT(cellId);
    }
    return this;
  }

  controlFREE(cellId) {
    this.forcusUnit(cellId);
  }

  controlMOVE(cellId) {
    const unit = this.forcusedUnit;
    const tunit = this.game.map.unit(cellId);
    if (this.game.phase != this.pnum || (this.forcusedCell != cellId && tunit)) {
      this.forcusUnit(cellId);
    } else if (unit && unit.pnum == this.pnum) {
      if (this.game.map.moveUnit(this.forcusedCell, cellId)) {
        this.mask = this.game.map.movingMap(cellId, true);
        this.movedCell = cellId;
        this.state.set('ACT');
      } else {
        this.clearForcus();
      }
    } else {
      this.clearForcus();
    }
  }

  controlACT(cellId) {
    if (this.mask.movable[cellId] != undefined) {
      this.actUnit();
    } else if (this.mask.actionable[cellId] != undefined) {
      if (this.game.map.isActionable(this.forcusedUnit, this.movedCell, cellId)) {
        this.actUnit(cellId);
      }
    } else {
      // cancel move
      this.game.map.moveUnit(this.movedCell, this.forcusedCell);
      this.clearForcus();
    }
  }

  forcusUnit(cellId) {
    const unit = this.game.map.unit(cellId);
    if (!unit || unit.acted) {
      return this.clearForcus();
    }
    this.mask = this.game.map.movingMap(cellId);
    this.forcusedCell = cellId;
    this.forcusedUnit = this.game.map.unit(cellId);
    this.state.set('MOVE');
  }

  actionForecast(cellId) {
    const unit = this.forcusedUnit;
    const target = this.game.map.unit(cellId);
    if (!this.state.is('ACT') || !unit || !target || !this.game.map.isActionable(unit, this.movedCell, cellId)) {
      return;
    }
    const result = {
      me: {
        name: unit.klass.name,
        hp: unit.hp
      },
      tg: {
        name: target.klass.name,
        hp: target.hp
      }
    };
    if (unit.klass.healer) {
      result.me.val = unit.klass.pow;
    } else {
      result.me.val = unit.effect(target);
      result.me.hit = unit.hitRate(target, this.game.map.field.avoid(cellId));
      result.me.crit = unit.critRate(target);
    }
    if (!unit.klass.healer && !target.klass.healer) {
      if (this.game.map.isActionable(target, cellId, this.movedCell)) {
        result.tg.val = target.effect(unit);
        result.tg.hit = target.hitRate(unit, this.game.map.field.avoid(this.movedCell));
        result.tg.crit = target.critRate(unit);
      }
    }
    return result;
  }

  actUnit(cellId = null) {
    this.socket.emit('action', this.forcusedCell, this.movedCell, cellId);
    this.state.set('EMITED');
  }

  clearForcus() {
    this.mask = {
      movable: {},
      actionbale: {}
    };
    this.forcusedCell = null;
    this.forcusedUnit = null;
    this.movedCell = null;
    this.state.set('FREE');
  }

  getPrepUnits(ids) {
    return ids.map(id => {
      return unitMaster[id];
    });
  }

};

