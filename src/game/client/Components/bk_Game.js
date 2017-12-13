import PIXI, { resources } from '../PIXI.js';

import Cursor from './Cursor.js';
import Unit from './Unit.js';
import Ranges from './Ranges.js';

const FREE = Symbol();
const MOVE = Symbol();
const ACT = Symbol();
const EMITED = Symbol();


export default class Game {

  constructor(game, cellSize, stage) {
    this.state = FREE;

    this.model = game;
    const { field } = game;
    this.cellSize = cellSize;


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
    };

    this.initTerrain(field);
    this.initUnits(game.units, field);


    stage.addChild(container);
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

  initUnits(units, field) {
    const { cellSize } = this;
    units.forEach(unitModel => {
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

  selectCell({ x, y }) {
    if (!this.model.field.isActiveCell(y, x)) {
      return;
    }
    const { model } = this;
    const cellId = model.field.cellId(y, x);
    this.forcus(cellId);

    switch (this.state) {
      case FREE:
        return this.forcus(cellId);
      case MOVE:
        return this.mightMove(cellId);
      case ACT:
    }
  }

  forcus(cellId) {
    const { model, cellSize } = this;
    const unit = model.unit(cellId);
    if (unit) {
      const ranges = new Ranges(model, cellSize);
      ranges.calculate(cellId, unit);
      ranges.render(this.layer.range, unit.klass.healer);
    }
  }

  mightMove(cellId) {
    // const { model } = this;
    // const newUnit = model.unit(cellId);
    // if (newUnit && newUnit != ui.forcusedUnit) {
      // return this.forcus(cellId);
    // } else if (me.offense != game.turn) {
      // return this.clearUI();
    // } else if (ui.forcusedUnit && ui.forcusedUnit.offense == game.turn) {
      // if (game.checkMovable(ui.forcusedCell, cellId)) {
        // return this.withMutations(mnt => {
          // mnt.set('room', mnt.room.set('game', game.moveUnit(ui.forcusedCell, cellId)))
            // .set('ui', ui.move(cellId).setActRange(game));
        // });
      // } else {
        // return this.clearUI();
      // }
    // }
    // return this.clearUI();
  }


}

