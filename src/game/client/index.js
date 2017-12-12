import PIXI, { resources } from './PIXI.js';

import Cursor from '.Sprites/Cursor.js';

export default class Client {

  constructor({ canvas, cellSize, width, height, game }) {
    this.game = game;
    const { field } = game;
    this.fullWidth = field.width * cellSize;
    this.fullHeight = field.height * cellSize;
    this.cellSize = cellSize;
    this.scale = 1;
    this.app = new PIXI.Application({
      width,
      height,
      view: canvas,
      sharedLoader: true,
    });
    const stage = new PIXI.Container();
    stage.interactive = true;
    // stage.interactiveChildren = true;
    // stage.on('click', e => {
      // console.log(e.data.global.x, e.data.global.y);
    // });

    this.layer = {
      terrain: new PIXI.Container(),
      range: new PIXI.Container(),
      units: new PIXI.Container(),
      ui: new PIXI.Container()
    };
    stage.addChild(this.layer.terrain);
    stage.addChild(this.layer.range);
    stage.addChild(this.layer.units);
    stage.addChild(this.layer.ui);
    this.app.stage = stage;
    this.buffers = {
      cursor: null,
      units: null,
      ranges: null,
      animation: null,
    };

    this.cursor = new Cursor(cellSize, this.layer.ui);
    this.unitsMap = new Map();
    this.setUnits(game.units);
    this.initTerrain(field);
    this.animation = null;

    let angle = 0;
    let amp = 0.1;
    let alpha = 1 - amp;
    this.app.ticker.add(delta => {
      angle = (angle + 3) % 360;
      const diff = Math.sin(angle * Math.PI / 180);
      this.layer.range.alpha = alpha + diff * amp;

      this.updateCursor();
      this.updateAnimation(delta);
      if (!this.animation) {
        this.updateUnits();
        this.updateRanges();
      }
      this.decelerateScroll(delta);
    });

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

  initUnits(units) {
    this.units.forEach(unitModel => {
      const unit = this.unitsMap.get(unitModel.seq);
      if (!unit) {
        const { game, cellSize } = this;
        this.unitsMap.set(unitModel.seq, new Unit(unitModel, game.field, cellSize, this.layer.units));
      } else {
        unit.update(unitModel);
      }
    });
    this.buffers.units = null;
  }

  updateUnits(data) {
    // data { unitSeq: cellId }

  }








  onHoverCell(callback) {
    //FIXME
    const cellId = null;
    callback(cellId);
  }

  listen(socket) {
    //FIXME
    socket.on('syncGame', payload => {

    });
    this.socket = socket;
  }

}

