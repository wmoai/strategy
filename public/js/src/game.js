// control state
const State = {
  select: Symbol(),
  move: Symbol(),
  act: Symbol()
}

export default class Gmae {
  constructor(land, units) {
    this.controlState = State.select;
    this.field = land.map(row => {
      return row.map(cell => {
        return {
          land: cell,
          over: {}
        };
      });
    });
    this.units = [];
    units.forEach(unit => {
      this.field[unit.y][unit.x].unit = unit;
      this.units.push(unit);
    });
    this.changePhase();
  }

  checkPhase() {
    let end = true;
    this.units.forEach(unit => {
      if (!unit.dead && unit.player == this.phase && !unit.isActed()) {
        end = false;
      }
    });
    if (end) {
      this.changePhase();
    }
  }

  changePhase() {
    this.units.forEach(unit => {
      unit.resetState();
    });
    this.phase = (this.phase == 1) ? 2 : 1;
    console.log(`phase player${this.phase}`);
  }

  selectCell(y, x) {
    switch (this.controlState) {
      case State.select:
        this.controlSelect(y, x);
        break;
      case State.move:
        this.controlMove(y, x);
        break;
      case State.act:
        this.controlAct(y, x);
        break;
    }
    this.checkPhase();
    return this;
  }

  controlSelect(y, x) {
    const unit = this.field[y][x].unit;
    if (unit && unit.isReady()) {
      this.setForcusedMovable(unit);
      this.controlState = State.move;
    }
  }
  controlMove(y, x) {
    const unit = this.forcus;
    if (!unit) {
      return;
    } else if (unit.isPhase(this.phase) && this.field[y][x].mask.movable) {
      if (this.field[y][x].unit && this.field[y][x].unit != unit) {
        return;
      }
      this.field[unit.y][unit.x].unit = null;
      unit.move(y, x);
      this.field[y][x].unit = unit;
      this.controlState = State.act;

      this.clearFieldMask();
      this.setForcusedActionable();
    } else {
      this.clearFieldMask();
      this.controlState = State.select;
    }
  }
  controlAct(y, x) {
    const unit = this.forcus;
    if (this.field[y][x].mask.actionable) {
      const target = this.field[y][x].unit;
      if (!target) {
        return;
      }
      this.act(unit, target);
      unit.standby();
    } else if (this.field[y][x].mask.movable) {
      unit.standby();
    } else {
      this.field[unit.y][unit.x].unit = null;
      unit.cancelMove();
      this.field[unit.y][unit.x].unit = unit;
    }
    this.forcus = null;
    this.clearFieldMask();
    this.controlState = State.select;
  }
  act(unit, target) {
    this.processAction(unit, target);
    if (this.checkAlive(target) && !unit.healer && !target.healer) {
      let dist = Math.abs(unit.x - target.x) + Math.abs(unit.y - target.y);
      let counterable = false;
      target.range.forEach(range => {
        if (dist == range) {
          counterable = true;
        }
      });
      if (counterable) {
        this.processAction(target, unit);
        this.checkAlive(unit);
      }
    }
  }
  processAction(actor, target) {
    if (actor.healer) {
      target.hp = Math.min(target.hp + actor.mgc, target.maxHp);
    } else if (!actor.magical) {
      target.hp -= Math.max(actor.atk - target.dff, 0);
    } else {
      target.hp -= Math.max(actor.mgc - target.spl, 0);
    }
  }
  checkAlive(unit) {
    if (unit.hp > 0) {
      return true;
    }
    unit.dead = true;
    this.field[unit.y][unit.x].unit = null;
    return false;
  }

  existsCell(y, x) {
    return (
      y >= 0
      && y < this.field.length
      && x >= 0
      && x < this.field[y].length
    );
  }

  setForcusedMovable(unit) {
    this.forcus = unit;
    const y = unit.y;
    const x = unit.x;
    this.field.forEach(row => {
      row.forEach(cell => {
        cell.mask = {
          foot: -cell.land,
          movable: false,
          actionable: false
        }
      });
    });

    const s4 = (y, x, foot, init) => {
      if (!this.existsCell(y, x)) {
        return;
      }
      const cell = this.field[y][x];
      if (cell.unit && cell.unit.player != unit.player) {
        return;
      }
      if (!init) {
        foot -= cell.land;
      }

      if (foot >= 0 && foot > cell.mask.foot) {
        if (foot >= 0) {
          cell.mask.movable = true;
        }
        cell.mask.foot = foot;
        unit.range.forEach(r => {
          const bd = 90 / r;
          for(let i=0; i<360; i+=bd) {
            const ay = y + (r * Math.sin(i * (Math.PI / 180)) | 0);
            const ax = x + (r * Math.cos(i * (Math.PI / 180)) | 0);
            if (this.existsCell(ay, ax)) {
              this.field[ay][ax].mask.actionable = true;
            }
          }
        });
        s4(y-1, x, foot);
        s4(y+1, x, foot);
        s4(y, x-1, foot);
        s4(y, x+1, foot);
      }
    }

    s4(y, x, unit.foot, true);
  }

  setForcusedActionable() {
    const unit = this.forcus;
    const y = unit.y;
    const x = unit.x;
    this.field[y][x].mask.movable = true;
    unit.range.forEach(r => {
      const bd = 90 / r;
      for(let i=0; i<360; i+=bd) {
        const ay = y + (r * Math.sin(i * (Math.PI / 180)) | 0);
        const ax = x + (r * Math.cos(i * (Math.PI / 180)) | 0);
        if (this.existsCell(ay, ax)) {
          this.field[ay][ax].mask.actionable = true;
        }
      }
    });
  }

  clearFieldMask() {
    this.field.forEach(row => {
      row.forEach(cell => {
        cell.mask = {};
      });
    });
  }


}
