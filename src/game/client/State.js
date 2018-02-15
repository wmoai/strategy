// @flow

import GameModel from '../models/Game.js';
import UnitModel from '../models/Unit.js';

const STATE: Map<string, Symbol> = new Map([
  ['FREE', Symbol()],
  ['MOVE', Symbol()],
  ['ACT', Symbol()],
  ['EMITED', Symbol()],
]);

export default class Game {
  _state: ?Symbol;
  hoveredCell: ?number;
  hoveredUnit: ?UnitModel;
  forcusedCell: ?number;
  forcusedUnit: ?UnitModel;
  movedCell: ?number;
  model: GameModel;

  constructor(model: GameModel) {
    this._state = STATE.get('FREE');
    this.model = model;
  }

  is(str: string): boolean {
    return this._state == STATE.get(str);
  }

  set(str: string) {
    this._state = STATE.get(str);
  }

  hoverCell(cellId: number) {
    this.hoveredCell = cellId;
  }

  hoverUnit(unit: ?UnitModel) {
    this.hoveredUnit = unit;
  }


  forcus(unitModel: UnitModel) {
    if (!unitModel) {
      return;
    }
    this.forcusedUnit = unitModel;
    this.forcusedCell = unitModel.state.cellId;
    this.set('MOVE');
  }

  move(cellId: number) {
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
  }


}
