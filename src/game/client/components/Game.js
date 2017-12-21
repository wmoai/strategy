import Component from './Component.js';
import createTerrain from './createTerrain.js';
import createCursor from './createCursor.js';
import createUnits from './createUnits.js';
import createRanges from './createRanges.js';

import State from '../State/Game.js';
import * as ai from '../lib/ai.js';

// import GameModel from '../../models/Game.js';
import createGame from '../../models/createGame.js';

const masterData = require('../../data/');

export default class Game extends Component {

  constructor({
    renderer,
    game,
    cellSize,
    isOffense,
    isSolo,
  }) {
    super();
    this.renderer = renderer;
    this.state = new State(game);

    this.model = game;
    const { field } = game;
    this.cellSize = cellSize;
    this.isOffense = isOffense;
    this.isSolo = isSolo;

    this.fullWidth = field.width * cellSize;
    this.fullHeight = field.height * cellSize;
    this.scale = 1;
    this.mouseX = 0;
    this.mouseY = 0;

    const { units } = game.getState();

    this.components = {
      cursor: createCursor(cellSize),
      units: createUnits({
        unitModels: units,
        field,
        cellSize,
      }),
    };

    this.container.addChild(createTerrain({ field, cellSize }));
    this.container.addChild(this.components.units.container);
    this.container.addChild(this.components.cursor.container);

    this.currentRanges = null;
    this.currentMoveAnimation = null;

    const myUnitModel = units.filter(unit => unit.isOffense == isOffense)[0];
    if (myUnitModel) {
      const unit = this.components.units.unit(myUnitModel.getState().seq);
      this.scrollTo(
        renderer.width/2 - (unit.container.x + cellSize/2) * this.scale,
        renderer.height/2 - (unit.container.y + cellSize/2) * this.scale 
      );
    }
  }

  update(delta) {
    if (this.components.units.update(delta, this.model.getState().units, this.currentRanges, this.currentMoveAnimation)) {
      this.followUnit();
      return true;
    }
    return false;
  }

  hoveredCell() {
    return this.state.hoveredCell;
  }

  hoveredUnit() {
    return this.state.hoveredUnit;
  }

  hoveredTerrain() {
    return masterData.terrain[this.model.field.cellTerrainId(this.state.hoveredCell)];
  }

  turnInfo() {
    const { model } = this;
    return {
      turn: model.getState().turn,
      remained: model.turnRemained(),
    };
  }

  isMyTurn() {
    return this.model.getState().turn == this.isOffense;
  }

  isAnimating() {
    if (!this.currentMoveAnimation || this.currentMoveAnimation.isEnd()) {
      return false;
    }
    return true;
  }

  followUnit() {
    if (!this.isAnimating()) {
      return;
    }
    const container = this.currentMoveAnimation.container;
    const { renderer, scale } = this;
    const cellSize = this.displayCellSize();
    const ax = container.x * scale;
    const ay = container.y * scale;
    const sx = this.container.x;
    const sy = this.container.y;
    const overX = ax + cellSize + sx - renderer.width;
    const underX = ax + sx;
    const overY = ay + cellSize + sy - renderer.height;
    const underY = ay + sy;

    let dx = overX > 0 ? overX : underX < 0 ? underX : 0;
    let dy = overY > 0 ? overY : underY < 0 ? underY : 0;
    this.scroll(dx, dy);
  }


  // updateModel(model) {
    // this.model = model;
  // }

  sync(gameData, actionData) {
    this.clearUI();

    if (actionData) {
      const { model, isOffense } = this;
      const { from, to } = actionData;
      const unitModel = model.getUnit(from);
      if (unitModel && unitModel.isOffense !== isOffense) {
        const ranges = createRanges(model, unitModel);
        ranges.calculate(from);
        const route = ranges.getRoute(to);

        this.currentMoveAnimation = this.components.units.createMoveAnimation(unitModel, route);
      }
    }
    // this.updateModel(gameData ? GameModel.restore(gameData) : null);
    this.model = createGame(gameData);
  }


  hover(clientX, clientY) {
    this.mouseX = clientX;
    this.mouseY = clientY;
    this.hoverCell(this.fieldCoordinates(clientX, clientY));
  }

  hoverCell({ x, y }) {
    const { model } = this;
    if (!model.field.isActiveCell(y, x)) {
      return;
    }
    this.components.cursor.update(x, y);
    const cellId = model.field.cellId(y, x);
    this.state.hoverCell(cellId);
    const unit = model.getUnit(cellId);
    this.state.hoverUnit(unit);
  }

  select(clientX, clientY, emitAction) {
    this.selectCell(this.fieldCoordinates(clientX, clientY), emitAction);
  }

  selectCell({ x, y }, emitAction) {
    if (!this.model.field.isActiveCell(y, x) || this.isAnimating()) {
      return;
    }
    const { model } = this;
    const cellId = model.field.cellId(y, x);

    if (this.state.is('FREE')) {
      this.forcus(cellId);
    } else if (this.state.is('MOVE')) {
      this.mightMove(cellId);
    } else if (this.state.is('ACT')) {
      this.mightAct(cellId, emitAction);
    }
  }

  forcus(cellId) {
    const { model } = this;
    const unitModel = model.getUnit(cellId);
    if (unitModel && !unitModel.getState().isActed) {
      this.state.forcus(unitModel);
      const ranges = createRanges(model, unitModel);
      ranges.calculate(cellId);
      this.currentRanges = ranges;
    }
  }

  mightMove(cellId) {
    const { model, state, isOffense } = this;
    const { turn } = model.getState();
    const { forcusedUnit, forcusedCell } = state;

    const prevUnit = model.getUnit(cellId);
    if (prevUnit && prevUnit != forcusedUnit) {
      return this.forcus(cellId);
    } else if (isOffense != turn) {
      return this.clearUI();
    } else if (forcusedUnit && forcusedUnit.isOffense == turn) {
      if (model.checkMovable(forcusedCell, cellId)) {
        this.animateMovement(cellId);
        return this.move(cellId);
      }
    }
    return this.clearUI();
  }

  animateMovement(cellId) {
    const { model, state } = this;
    const { forcusedCell, forcusedUnit } = state;

    const moveRanges = createRanges(model, forcusedUnit);
    moveRanges.calculate(forcusedCell);
    const route = moveRanges.getRoute(cellId);
    this.currentMoveAnimation = this.components.units.createMoveAnimation(forcusedUnit, route);
  }

  move(cellId) {
    const { model, state } = this;
    const { forcusedCell, forcusedUnit } = state;
    // this.updateModel(model.moveUnit(forcusedCell, cellId));
    model.moveUnit(forcusedCell, cellId);

    const actRanges = createRanges(model, forcusedUnit);
    actRanges.setMovable(cellId);
    this.currentRanges = actRanges;

    this.state.move(cellId);
  }

  mightAct(cellId, emitAction) {
    const { movedCell, forcusedCell } = this.state;
    if (!this.isActionable(cellId)) {
      this.undo();
      this.clearUI();
      return;
    }
    const actCell = (cellId != movedCell) ? cellId : undefined;
    this.state.act();
    if (this.isSolo) {
      // this.updateModel(this.model.fixAction(forcusedCell, movedCell, actCell));
      this.model.fixAction(forcusedCell, movedCell, actCell);
      this.clearUI();
    }

    if (emitAction && typeof emitAction === 'function') {
      emitAction(forcusedCell, movedCell, actCell);
    }
  }

  isActionable(cellId) {
    const { model } = this;
    const { movedCell, forcusedUnit } = this.state;
    return cellId == movedCell
      || model.checkActionable(forcusedUnit, movedCell, cellId);
  }

  undo() {
    const { movedCell, forcusedCell } = this.state;
    // this.updateModel(this.model.moveUnit(movedCell, forcusedCell));
    this.model.moveUnit(movedCell, forcusedCell);
  }


  clearUI() {
    this.currentRanges = null;
    this.state.clearUI();
  }



  isCOMTurn() {
    if (this.model.getState().turn === this.isOffense) {
      return false;
    }
    return this.isSolo;
  }

  mightActAI() {
    if (!this.isCOMTurn()) {
      return false;
    }
    this.state.clearUI();
    const { model, isOffense } = this;

    const action = ai.getActionByAI(model, isOffense);
    if (action) {
      const { from, to, target, unitModel, route } = action;
      // this.updateModel(this.model.fixAction(from, to, target));
      this.model.fixAction(from, to, target);
      this.currentMoveAnimation = this.components.units.createMoveAnimation(unitModel, route);
      return true;
    }
    const movement = ai.getMovementByAI(model, isOffense);
    if (!movement) {
      // this.updateModel(this.model.changeTurn());
      this.model.changeTurn();
      return true;
    }
    const { from, to, unitModel, route } = movement;
    if (unitModel && route) {
      this.currentMoveAnimation = this.components.units.createMoveAnimation(unitModel, route);
    }
    // this.updateModel(this.model.fixAction(from, to));
    this.model.fixAction(from, to);
    return true;
  }


  displayCellSize() {
    return this.cellSize * this.scale;
  }

  fieldCoordinates(clientX, clientY) {
    const cellSize = this.displayCellSize();
    return {
      x: Math.floor((clientX - this.container.x) / cellSize),
      y: Math.floor((clientY - this.container.y) / cellSize),
    };
  }

  zoom(delta) {
    const scale = Math.max(0.8, Math.min(1.8, this.scale - delta)).toFixed(2);
    const rate = scale / this.scale;
    this.container.scale.x = scale;
    this.container.scale.y = scale;
    this.scale = scale;
    this.scrollTo(
      (this.container.x - this.mouseX) * rate + this.mouseX,
      (this.container.y - this.mouseY) * rate + this.mouseY
    );
  }

  scroll(dx, dy) {
    this.scrollTo(
      this.container.x - dx,
      this.container.y - dy,
    );
  }

  scrollTo(x, y) {
    const { renderer, fullWidth, fullHeight, scale } = this;
    let minX = renderer.width - fullWidth * scale;
    minX = minX > 0 ? minX / 2 : minX;
    const minY = renderer.height - fullHeight * scale;
    this.container.x = Math.max(Math.min(x, 0), minX);
    this.container.y = Math.min(Math.max(y, minY), 0);
  }

  forecast() {
    const { model, state } = this;
    const unit = state.forcusedUnit;
    const target = model.getUnit(state.hoveredCell);
    if (!state.is('ACT') || !unit || !target || !model.checkActionable(unit, state.movedCell, state.hoveredCell)) {
      return null;
    }

    const result = {
      me: {
        name: unit.status.name,
        hp: unit.getState().hp,
        isOffense: unit.isOffense
      },
      tg: {
        name: target.status.name,
        hp: target.getState().hp,
        isOffense: target.isOffense
      }
    };
    if (unit.klass.healer) {
      result.me.val = unit.status.pow;
    } else {
      result.me.val = target.effectValueBy(unit);
      result.me.hit = target.hitRateBy(unit, masterData.terrain[model.field.cellTerrainId(state.hoveredCell)].avoidance);
      result.me.crit = target.critRateBy(unit);
    }
    if (!unit.klass.healer && !target.klass.healer) {
      //counter attack
      if (model.checkActionable(target, state.hoveredCell, state.movedCell)) {
        result.tg.val = unit.effectValueBy(target);
        result.tg.hit = unit.hitRateBy(target, masterData.terrain[model.field.cellTerrainId(state.movedCell)].avoidance);
        result.tg.crit = unit.critRateBy(target);
      }
    }
    return result;
  }


}
