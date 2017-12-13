import PIXI, { resources } from '../../PIXI.js';

import Cursor from '../Cursor.js';
import Unit from '../Unit.js';
import Ranges from '../Ranges.js';

import State from './State.js';
import * as ai from './ai.js';

import MoveUnitAnimation from '../../libs/MoveUnitAnimation.js';

import GameModel from '../../../models/Game.js';

export default class Game {

  constructor({ game, cellSize, isOffense, stage, isSolo }) {
    this.state = new State();

    this.model = game;
    const { field } = game;
    this.cellSize = cellSize;
    this.isOffense = isOffense;
    this.isSolo = isSolo;


    const container = new PIXI.Container();
    this.layer = {
      terrain: new PIXI.Container(),
      range: new PIXI.Container(),
      units: new PIXI.Container(),
      ui: new PIXI.Container()
    };
    container.addChild(this.layer.terrain);
    container.addChild(this.layer.range);
    container.addChild(this.layer.units);
    container.addChild(this.layer.ui);

    this.components = {
      cursor: new Cursor(cellSize, this.layer.ui),
      units: new Map(),
      ranges: null,
    };
    this.shouldReflectUnits = false;
    this.animations = [];

    this.initTerrain(field);
    this.initUnits(game.units, field);


    stage.addChild(container);
  }

  updateScreen(delta) {
    if (this.hasAnimation()) {
      this.updateAnimation(delta);
      return;
    }
    this.reflectUnits();
    this.reflectRanges();
    this.mightActAI();
  }

  hasAnimation() {
    return this.animations.length > 0;
  }

  updateAnimation(delta) {
    if (!this.hasAnimation()) {
      return;
    }
    const animation = this.animations[0];
    // this.stopScroll();
    animation.update(delta);
    // this.followUnit(this.animation.container);
    if (animation.isEnd) {
      this.animations.shift();
    }
  }

  reflectUnits() {
    if (!this.shouldReflectUnits) {
      return;
    }
    this.shouldReflectUnits = false;
    this.model.units.forEach(unitModel => {
      const unit = this.components.units.get(unitModel.seq);
      unit.update(unitModel);
    });
  }

  reflectRanges() {
    if (!this.components.ranges) {
      return;
    }
    const { layer, cellSize } = this;
    layer.range.removeChildren();
    this.components.ranges.render(layer.range, cellSize);
    this.components.ranges = null;
  }


  updateModel(model) {
    this.model = model;
    this.shouldReflectUnits = true;
  }

  sync(gameData, actionData) {
    this.clearUI();

    if (actionData) {
      const { model, isOffense, cellSize } = this;
      const { from, to } = actionData;
      const unitModel = model.unit(from);
      if (unitModel && unitModel.offense !== isOffense) {
        const ranges = new Ranges(model);
        ranges.calculate(from, unitModel);
        const route = ranges.getMoveRoute(to);

        const unit = this.components.units.get(unitModel.seq);
        const animation = new MoveUnitAnimation(unit.container, route, model.field, cellSize, () => {});
        this.animations.push(animation);
      }
    }
    this.updateModel(gameData ? GameModel.restore(gameData) : null);
  }


  initTerrain(field) {
    const layer = this.layer.terrain;
    layer.removeChildren();
    const { cellSize } = this;

    const terrains = new PIXI.Graphics();
    field.rows().forEach((row, y) => {
      row.forEach((terrain, x) => {
        const same = field.isSameTerrainWithNeighbor(y, x);
        terrains.addChild(this.createTerrainSprite(x, y, terrain, same, true, true));
        terrains.addChild(this.createTerrainSprite(x, y, terrain, same, true, false));
        terrains.addChild(this.createTerrainSprite(x, y, terrain, same, false, true));
        terrains.addChild(this.createTerrainSprite(x, y, terrain, same, false, false));
      });
    });
    terrains.cacheAsBitmap = true;
    layer.addChild(terrains);

    // outer area shadow
    const shadow = new PIXI.Graphics();
    shadow.lineStyle(cellSize*1.5, 0, 0.3);
    shadow.drawRect(0, 0, field.width*cellSize, field.height*cellSize);
    shadow.filters = [new PIXI.filters.BlurFilter()];
    shadow.cacheAsBitmap = true;
    layer.addChild(shadow);

    // bases mark
    field.bases().map(bp => {
      const y = Math.floor(bp / field.width);
      const x = bp % field.width;

      const base = new PIXI.Graphics();
      base.beginFill(0x0000ff, 0.15);
      base.lineStyle(4, 0x0000ff, 0.5);
      base.drawRect(x*cellSize+1, y*cellSize+2, cellSize-3, cellSize-4);
      layer.addChild(base);
    });
  }

  createTerrainSprite(x, y, terrain, same, top, left) {
    const { cellSize } = this;
    let formI = 0;
    if (top ? same.top : same.bottom) {
      if (left ? same.left : same.right) {
        if (top ? (left ? same.tl : same.tr) : (left ? same.bl : same.br)) {
          formI = 4;
        } else {
          formI = 3;
        }
      } else {
        formI = 1;
      }
    } else if (left ? same.left : same.right) {
      formI = 2;
    }
    let cornerI = (top ? 0 : 2) + (left ? 0: 1);

    const sprite = new PIXI.Sprite(resources.terrain.get(terrain)[formI][cornerI]);
    sprite.x = x * cellSize + (left ? 0 : cellSize/2);
    sprite.y = y * cellSize + (top ? 0 : cellSize/2);
    sprite.width = cellSize/2;
    sprite.height = cellSize/2;
    return sprite;
  }

  initUnits(unitModels, field) {
    const { cellSize } = this;
    unitModels.forEach(unitModel => {
      const unit = new Unit(unitModel, field, cellSize, this.layer.units);
      this.components.units.set(unitModel.seq, unit);
    });
  }

  hoverCell({ x, y }) {
    if (!this.model.field.isActiveCell(y, x)) {
      return;
    }
    this.components.cursor.update(x, y);
    //FIXME hover unit
  }

  selectCell({ x, y }, emitAction) {
    if (!this.model.field.isActiveCell(y, x) || this.hasAnimation()) {
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
    const unitModel = model.unit(cellId);
    if (unitModel) {
      this.state.forcus(unitModel);
      const ranges = new Ranges(model);
      ranges.calculate(cellId, unitModel);
      this.layer.range.removeChildren();
      this.components.ranges = ranges;
    }
  }

  mightMove(cellId) {
    const { model, state, isOffense } = this;
    const { forcusedUnit, forcusedCell } = state;

    const prevUnit = model.unit(cellId);
    if (prevUnit && prevUnit != forcusedUnit) {
      return this.forcus(cellId);
    } else if (isOffense != model.turn) {
      return this.clearUI();
    } else if (forcusedUnit && forcusedUnit.offense == model.turn) {
      if (model.checkMovable(forcusedCell, cellId)) {
        this.animateMovement(cellId);
        return this.move(cellId);
      }
    }
    return this.clearUI();
  }

  animateMovement(cellId) {
    const { model, state, cellSize } = this;
    const { forcusedCell, forcusedUnit } = state;

    const moveRanges = new Ranges(model);
    moveRanges.calculate(forcusedCell, forcusedUnit);
    const route = moveRanges.getMoveRoute(cellId);

    const unit = this.components.units.get(forcusedUnit.seq);
    const animation = new MoveUnitAnimation(unit.container, route, model.field, cellSize, () => {});
    this.animations.push(animation);
  }

  move(cellId) {
    const { model, state } = this;
    const { forcusedCell, forcusedUnit } = state;
    this.updateModel(model.moveUnit(forcusedCell, cellId));

    const actRanges = new Ranges(model);
    actRanges.setMovable(forcusedUnit, cellId);
    this.components.ranges = actRanges;

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
      this.updateModel(this.model.fixAction(forcusedCell, movedCell, actCell));
      this.clearUI();
    }

    // setImmediate(() => {
    if (emitAction && typeof emitAction === 'function') {
      emitAction(forcusedCell, movedCell, actCell);
    }
    // });
  }

  isActionable(cellId) {
    const { model } = this;
    const { movedCell, forcusedUnit } = this.state;
    return cellId == movedCell
      || model.checkActionable(forcusedUnit, movedCell, cellId);
  }

  undo() {
    const { movedCell, forcusedCell } = this.state;
    this.updateModel(this.model.moveUnit(movedCell, forcusedCell));
  }


  clearUI() {
    this.components.ranges = null;
    this.layer.range.removeChildren();
    this.state = new State();
  }



  isCOMTurn() {
    if (this.model.turn === this.isOffense) {
      return false;
    }
    return this.isSolo;
  }

  mightActAI() {
    if (!this.isCOMTurn() || this.hasAnimation()) {
      return;
    }
    const { model, isOffense, cellSize } = this;

    const action = ai.getActionByAI(model, isOffense);
    if (action) {
      const { from, to, target, unitModel, route } = action;
      const unit = this.components.units.get(unitModel.seq);
      const animation = new MoveUnitAnimation(unit.container, route, model.field, cellSize, () => {});
      this.animations.push(animation);
      this.updateModel(this.model.fixAction(from, to, target));
      return;
    }
    const movement = ai.getMovementByAI(model, isOffense);
    if (!movement) {
      return this.updateModel(this.model.changeTurn());
    }
    const { from, to, unitModel, route } = movement;
    if (unitModel && route) {
      const unit = this.components.units.get(unitModel.seq);
      const animation = new MoveUnitAnimation(unit.container, route, model.field, cellSize, () => {});
      this.animations.push(animation);
    }
    this.updateModel(this.model.fixAction(from, to));

  }

}

