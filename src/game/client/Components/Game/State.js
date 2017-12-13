
const STATE = new Map();
STATE.set('FREE', Symbol());
STATE.set('MOVE', Symbol());
STATE.set('ACT', Symbol());
STATE.set('EMITED', Symbol());


export default class State {
  constructor() {
    this._state = STATE.get('FREE');
    this.hoveredCell = null;
    this.hoveredUnit = null;
    this.forcusedCell = null;
    this.forcusedUnit = null;
    this.movedCell = null;
    this.actionForecast = null;

    this.model = null;
  }

  is(str) {
    return this._state == STATE.get(str);
  }

  set(str) {
    this._state = STATE.get(str);
  }


  forcus(unitModel) {
    if (!unitModel) {
      return;
    }
    this.forcusedUnit = unitModel;
    this.forcusedCell = unitModel.cellId;
    this.set('MOVE');
  }

  move(cellId) {
    this.movedCell = cellId;
    //FIXME set animation
    this.set('ACT');
  }

  act() {
    this.set('EMITED');
  }


}
