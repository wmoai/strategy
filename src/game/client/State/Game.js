
const STATE = new Map();
STATE.set('FREE', Symbol());
STATE.set('MOVE', Symbol());
STATE.set('ACT', Symbol());
STATE.set('EMITED', Symbol());


export default class Game {
  constructor(model) {
    this._state = STATE.get('FREE');
    this.hoveredCell = null;
    this.hoveredUnit = null;
    this.forcusedCell = null;
    this.forcusedUnit = null;
    this.movedCell = null;
    this.actionForecast = null;

    this.model = model;
  }

  is(str) {
    return this._state == STATE.get(str);
  }

  set(str) {
    this._state = STATE.get(str);
  }

  hoverCell(cellId) {
    this.hoveredCell = cellId;
  }

  hoverUnit(unit) {
    this.hoveredUnit = unit;
    this.actionForecast = null;
  }


  forcus(unitModel) {
    if (!unitModel) {
      return;
    }
    this.forcusedUnit = unitModel;
    this.forcusedCell = unitModel.getState().cellId;
    this.set('MOVE');
  }

  move(cellId) {
    this.movedCell = cellId;
    this.set('ACT');
  }

  act() {
    this.set('EMITED');
  }

  clearUI() {
    this._state = STATE.get('FREE');
    this.hoveredCell = null;
    this.hoveredUnit = null;
    this.forcusedCell = null;
    this.forcusedUnit = null;
    this.movedCell = null;
    this.actionForecast = null;
  }


}
