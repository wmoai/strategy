// @flow
import PIXI from '../PIXI.js';

import Component from './Component.js';
import TerrainComponent from './Terrain.js';
import CursorComponent from './Cursor.js';
import UnitsComponent from './Units.js';
import TimerComponent from './Timer.js';
import Updater from '../lib/Updater.js';
import Animation from '../animations/Animation.js';
import ChangeHp from '../animations/ChangeHp.js';
import Ranges from '../lib/Ranges.js';
import TurnStart from './TurnStart.js';
import Scroll from '../animations/Scroll.js';

import State from '../State.js';

import GameModel from '../../models/Game.js';
import UnitModel from '../../models/Unit.js';

import * as masterData from '../../data/';

export default class Game extends Component {
  renderer: any;
  state: State;
  model: GameModel;
  cellSize: number;
  isOffense: boolean;
  fullWidth: number;
  fullHeight: number;
  scale: number;
  mouseX: number;
  mouseY: number;
  layer: {
    main: any,
    overlay: any
  };
  components: {
    turnStart: TurnStart,
    timer: TimerComponent,
    cursor: CursorComponent,
    units: UnitsComponent
  };
  postUpdate: ?(void) => boolean;

  updateQueue: Array<Updater>;
  turnBuffer: ?boolean;
  onChangeTurn: ?(boolean, number) => void;
  onTimeOut: ?(void) => void;
  isTimeOut: boolean;
  onEnd: ?(boolean) => void;

  constructor({
    renderer,
    game,
    cellSize,
    isOffense
  }: {
    renderer: any,
    game: GameModel,
    cellSize: number,
    isOffense: boolean
  }) {
    super();
    this.renderer = renderer;
    this.state = new State(game);

    this.model = game;
    const { field } = game;
    this.cellSize = cellSize;
    this.isOffense = isOffense;
    this.isTimeOut = false;

    this.fullWidth = field.width * cellSize;
    this.fullHeight = field.height * cellSize;
    this.scale = 1;
    this.mouseX = 0;
    this.mouseY = 0;

    this.components = {
      turnStart: new TurnStart(),
      timer: new TimerComponent(),
      cursor: new CursorComponent(cellSize),
      units: new UnitsComponent({
        unitModels: game.units,
        field,
        cellSize
      })
    };

    this.layer = {
      main: new PIXI.Container(),
      overlay: new PIXI.Container()
    };
    this.container.addChild(this.layer.main);
    this.container.addChild(this.layer.overlay);

    const terrainComponent = new TerrainComponent({ field, cellSize });
    this.layer.main.addChild(terrainComponent.container);
    this.layer.main.addChild(this.components.units.container);
    this.layer.main.addChild(this.components.cursor.container);
    this.layer.overlay.addChild(this.components.turnStart.container);
    this.layer.overlay.addChild(this.components.timer.container);

    this.updateQueue = [];

    const myUnitModel = game.units
      .filter(unit => unit.isOffense == isOffense)
      .pop();
    if (myUnitModel) {
      const unit = this.components.units.unit(myUnitModel.seq);
      if (unit) {
        this.scrollTo(
          renderer.width / 2 - (unit.container.x + cellSize / 2) * this.scale,
          renderer.height / 2 - (unit.container.y + cellSize / 2) * this.scale
        );
      }
    }
  }

  update(delta: number) {
    const updater = this.currentUpdater();
    const { cursor, timer } = this.components;
    if (this.isMyTurn()) {
      timer.update(this.renderer.width);
    }
    if (updater) {
      if (updater instanceof Animation) {
        this.followScreen(updater.container);
        cursor.container.visible = !(updater instanceof ChangeHp);
      }
      updater.update(delta);
      return true;
    }
    cursor.container.visible = true;

    if (this.model.state.isEnd) {
      const onEnd = this.onEnd,
        winner = this.model.state.winner;
      if (onEnd && winner != null) {
        onEnd(winner);
      }
    }

    if (this.turnBuffer != this.model.state.turn) {
      this.changeTurn(this.model.state.turn);
      return true;
    }
    if (this.postUpdate) {
      this.postUpdate();
    }
    if (!this.isTimeOut && timer.isEnd && this.isMyTurn()) {
      this.isTimeOut = true;
      if (this.onTimeOut) {
        this.onTimeOut();
      }
    }
    return false;
  }

  currentUpdater() {
    if (this.updateQueue.length < 1) {
      return null;
    }
    const updater = this.updateQueue[0];
    if (updater.isEnd) {
      this.updateQueue.shift();
      return this.currentUpdater();
    }
    return updater;
  }

  reflectUnits(units: ?Array<UnitModel>) {
    let models = units || this.model.units;
    this.updateQueue.push(
      new Updater(0, () => {
        this.components.units.updateUnits(models);
      })
    );
  }

  reflectRanges(ranges: ?Ranges) {
    this.updateQueue.push(
      new Updater(0, () => {
        this.components.units.updateRanges(ranges);
      })
    );
  }

  changeTurn(turn: boolean) {
    this.turnBuffer = turn;
    this.undo();
    this.clearUI();
    this.reflectUnits();
    const onChangeTurn = this.onChangeTurn;
    if (onChangeTurn) {
      onChangeTurn(this.model.state.turn, this.model.turnRemained());
    }
    this.animateTurnStart();
  }

  animateMovement(unit: UnitModel, from: number, to: ?number) {
    if (to == null) {
      return;
    }
    const { model } = this;

    const moveRanges = new Ranges(model, unit);
    moveRanges.calculate(from);
    const route = moveRanges.getRoute(to);
    const animation = this.components.units.createMoveAnimation(unit, route);
    if (animation) {
      this.forcusContainer(animation.container);
      this.updateQueue.push(animation);
    }
  }

  animateChangeHp(changes: Array<{ seq: number, hp: number }>) {
    changes.forEach(change => {
      const animation = this.components.units.createChangeHpAnimation(change);
      if (animation) {
        this.updateQueue.push(animation);
      }
    });
  }

  animateTurnStart() {
    const { renderer, components } = this;
    const isMyTurn = this.isMyTurn();
    const updater = components.turnStart.createUpdater(
      isMyTurn,
      renderer.width,
      Math.min(renderer.height, this.layer.main.height)
    );
    if (isMyTurn) {
      updater.after = () => {
        this.isTimeOut = false;
        components.timer.restart(90000);
      };
    } else {
      components.timer.stop();
    }
    this.updateQueue.push(updater);
  }

  forcusContainer(container: any) {
    const { renderer, scale } = this;
    const cellSize = this.displayCellSize();
    const ax = container.x * scale;
    const ay = container.y * scale;
    const sx = this.layer.main.x;
    const sy = this.layer.main.y;
    const overX = ax + cellSize + sx - renderer.width;
    const underX = ax + sx;
    const overY = ay + cellSize + sy - renderer.height;
    const underY = ay + sy;

    let dx = overX > 0 ? overX : underX < 0 ? underX : 0;
    let dy = overY > 0 ? overY : underY < 0 ? underY : 0;
    if (dx !== 0 || dy !== 0) {
      this.updateQueue.push(new Scroll(this, dx, dy));
    }
  }

  endMyTurn(emit: void => void) {
    if (this.isMyTurn()) {
      if (emit && typeof emit === 'function') {
        emit();
      }
    }
  }

  hoveredCell() {
    return this.state.hoveredCell;
  }

  hoveredUnit() {
    const unit = this.state.hoveredUnit
      ? this.state.hoveredUnit
      : this.state.forcusedUnit;
    if (unit && !unit.isAlive()) {
      return null;
    }
    return unit;
  }

  hoveredTerrain() {
    if (this.state.hoveredCell != null) {
      const terrainId = this.model.field.cellTerrainId(this.state.hoveredCell);
      if (terrainId != null) {
        return masterData.getTerrain(terrainId);
      }
    }
    return null;
  }

  turnInfo() {
    const { model } = this;
    return {
      turn: model.state.turn,
      remained: model.turnRemained()
    };
  }

  isMyTurn() {
    return this.model.state.turn == this.isOffense;
  }

  followScreen(container: any) {
    const { renderer, scale } = this;
    const cellSize = this.displayCellSize();
    const ax = container.x * scale;
    const ay = container.y * scale;
    const sx = this.layer.main.x;
    const sy = this.layer.main.y;
    const overX = ax + cellSize + sx - renderer.width;
    const underX = ax + sx;
    const overY = ay + cellSize + sy - renderer.height;
    const underY = ay + sy;

    let dx = overX > 0 ? overX : underX < 0 ? underX : 0;
    let dy = overY > 0 ? overY : underY < 0 ? underY : 0;
    this.scroll(dx, dy);
  }

  sync(gameData: any, actionData: any) {
    this.clearUI();

    if (actionData) {
      const { model, isOffense } = this;
      const { from, to, changes } = actionData;
      const unitModel = model.getUnit(from);
      if (unitModel && unitModel.isOffense !== isOffense) {
        this.animateMovement(unitModel, from, to);
      }
      this.animateChangeHp(changes);
    }
    const newModel = new GameModel(gameData);
    this.reflectUnits(newModel.units);
    this.model = newModel;
  }

  hover(clientX: number, clientY: number) {
    this.mouseX = clientX;
    this.mouseY = clientY;
    this.hoverCell(this.fieldCoordinates(clientX, clientY));
  }

  hoverCell({ x, y }: { x: number, y: number }) {
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

  select(
    clientX: number,
    clientY: number,
    emitAction: ?(number, number, ?number) => void
  ) {
    if (this.currentUpdater()) {
      return;
    }
    this.selectCell(this.fieldCoordinates(clientX, clientY), emitAction);
  }

  selectCell(
    { x, y }: { x: number, y: number },
    emitAction: ?(number, number, ?number) => void
  ) {
    if (!this.model.field.isActiveCell(y, x) || this.currentUpdater()) {
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

  forcus(cellId: number) {
    const { model } = this;
    const unitModel = model.getUnit(cellId);
    if (unitModel && !unitModel.state.isActed) {
      this.state.forcus(unitModel);
      const ranges = new Ranges(model, unitModel);
      ranges.calculate(cellId);
      this.reflectRanges(ranges);
    }
  }

  mightMove(cellId: number) {
    const { model, state } = this;
    const { turn } = model.state;
    const { forcusedUnit, forcusedCell } = state;

    const prevUnit = model.getUnit(cellId);
    if (prevUnit && prevUnit != forcusedUnit) {
      return this.forcus(cellId);
    } else if (!this.isMyTurn()) {
      return this.clearUI();
    } else if (forcusedUnit && forcusedUnit.isOffense == turn) {
      if (forcusedCell != null && model.checkMovable(forcusedCell, cellId)) {
        return this.move(forcusedUnit, forcusedCell, cellId);
      }
    }
    return this.clearUI();
  }

  move(unit: UnitModel, from: number, to: number) {
    const { model } = this;
    this.reflectRanges(null);
    this.animateMovement(unit, from, to);

    model.moveUnit(from, to);
    const actRanges = new Ranges(model, unit);
    actRanges.setMovable(to);
    this.reflectUnits();
    this.reflectRanges(actRanges);

    this.state.move(to);
  }

  mightAct(cellId: number, emitAction: ?(number, number, ?number) => void) {
    const { movedCell, forcusedCell } = this.state;
    if (
      !this.isActionable(cellId) ||
      movedCell == null ||
      forcusedCell == null
    ) {
      this.undo();
      this.clearUI();
      return;
    }
    const actCell = cellId != movedCell ? cellId : undefined;
    this.state.act();
    this.act(forcusedCell, movedCell, actCell, emitAction);
  }

  act(
    from: number,
    to: number,
    target: ?number,
    emitAction: ?(number, number, ?number) => void
  ) {
    if (emitAction && typeof emitAction === 'function') {
      emitAction(from, to, target);
    }
  }

  isActionable(cellId: number) {
    const { model } = this;
    const { movedCell, forcusedUnit } = this.state;
    if (movedCell == null || forcusedUnit == null) {
      return false;
    }
    return (
      cellId == movedCell ||
      model.checkActionable(forcusedUnit, movedCell, cellId)
    );
  }

  undo() {
    const { movedCell, forcusedCell } = this.state;
    if (movedCell != null && forcusedCell != null) {
      this.model.moveUnit(movedCell, forcusedCell);
      this.reflectUnits();
    }
  }

  clearUI() {
    this.reflectRanges(null);
    this.hoverCell(this.fieldCoordinates(this.mouseX, this.mouseY));
    this.state.clearUI();
  }

  displayCellSize() {
    return this.cellSize * this.scale;
  }

  fieldCoordinates(clientX: number, clientY: number) {
    const cellSize = this.displayCellSize();
    return {
      x: Math.floor((clientX - this.layer.main.x) / cellSize),
      y: Math.floor((clientY - this.layer.main.y) / cellSize)
    };
  }

  zoom(delta: number) {
    const scale = Number(
      Math.max(0.8, Math.min(1.8, this.scale - delta)).toFixed(2)
    );
    const rate = scale / this.scale;
    this.layer.main.scale.x = scale;
    this.layer.main.scale.y = scale;
    this.scale = scale;
    this.scrollTo(
      (this.layer.main.x - this.mouseX) * rate + this.mouseX,
      (this.layer.main.y - this.mouseY) * rate + this.mouseY
    );
  }

  scroll(dx: number, dy: number) {
    this.scrollTo(this.layer.main.x - dx, this.layer.main.y - dy);
  }

  scrollTo(x: number, y: number) {
    const { renderer, fullWidth, fullHeight, scale } = this;
    let minX = renderer.width - fullWidth * scale;
    minX = minX > 0 ? minX / 2 : minX;
    const minY = renderer.height - fullHeight * scale;
    const nx = Math.max(Math.min(x, 0), minX);
    const ny = Math.min(Math.max(y, minY), 0);
    this.layer.main.x = nx;
    this.layer.main.y = ny;
  }

  forecast() {
    const { model, state } = this;
    const { forcusedUnit, hoveredCell, movedCell } = state;
    if (
      !state.is('ACT') ||
      forcusedUnit == null ||
      hoveredCell == null ||
      movedCell == null
    ) {
      return;
    }
    return model.getForecast(forcusedUnit, movedCell, hoveredCell);
  }
}
