import PIXI, { resources, preload } from './PIXI.js';

import Cursor from './Cursor.js';
import Unit from './Unit.js';

export default class Renderer {

  static preload() {
    return preload();
  }

  constructor({ canvas, game, cellSize, width, height }) {
    this.game = game;
    const { field } = game;
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.baseWidth = field.width * cellSize;
    this.baseHeight = field.height * cellSize;
    this.cellSize = cellSize;
    this.scale = 1;
    this.app = new PIXI.Application({
      width,
      height,
      view: canvas,
      sharedLoader: true,
    });
    const stage = new PIXI.Container();
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


    this.cursor = new Cursor(cellSize, this.layer.ui);
    const unitsMap = new Map();
    game.units.forEach(unit => {
      unitsMap.set(unit.seq, new Unit(unit, field, cellSize, this.layer.units));
    });
    this.unitsMap = unitsMap;
    this.initTerrain(field);

    const ticker = new PIXI.ticker.Ticker();
    let angle = 0;
    let amp = 0.1;
    let alpha = 1 - amp;
    ticker.add(delta => {
      angle = (angle + 3) % 360;
      const diff = Math.sin(angle * Math.PI / 180);
      this.layer.range.alpha = alpha + diff * amp;

      this.updateAnimation(delta);
    });
    ticker.start();
  }

  setAnimation(action, callback) {
    if (!action) {
      Array.from(this.unitsMap.keys()).forEach(key => {
        const unit = this.unitsMap.get(key);
        unit.omitCurrenAnimation();
      });
      return;
    }
    if (!action.unit) {
      return;
    }
    const unit = this.unitsMap.get(action.unit.seq);
    unit.setMoveAnimation(action.options.route, callback);
  }

  updateAnimation(delta) {
    Array.from(this.unitsMap.keys()).forEach(key => {
      const unit = this.unitsMap.get(key);
      unit.updateAnimation(delta);
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

  updateCursor(x, y) {
    this.cursor.update(x, y);
  }

  updateUnits(units) {
    units.forEach(unit => {
      const u = this.unitsMap.get(unit.seq);
      u.update(unit);
    });
  }

  updateRanges(ranges, unit) {
    const layer = this.layer.range;
    layer.removeChildren();
    if (!ranges) {
      return;
    }
    const { game, cellSize } = this;
    const movables = ranges.getMovables();
    const actionables = ranges.getActionables();
    if (actionables) {
      const isHealer = unit ? unit.klass.healer : false;
      actionables.filter(cid => !movables || !movables.includes(cid)).map(cid => {
        const { y, x } = game.field.coordinates(cid);
        const color = isHealer ? 0x87ceeb : 0xffd700;
        const highlight = new PIXI.Graphics();
        highlight.beginFill(color, 0.5);
        highlight.lineStyle(1, color);
        highlight.drawRect(x*cellSize, y*cellSize, cellSize, cellSize);
        layer.addChild(highlight);
      });
    }
    if (movables) {
      movables.map(cid => {
        const { y, x } = game.field.coordinates(cid);
        const color = 0x98fb98;
        const highlight = new PIXI.Graphics();
        highlight.beginFill(color, 0.5);
        highlight.lineStyle(1, color);
        highlight.drawRect(x*cellSize, y*cellSize, cellSize, cellSize);
        layer.addChild(highlight);
      });
    }
  }


  zoom(delta, tx, ty) {
    const scale = Math.max(1, Math.min(1.8, this.scale - delta)).toFixed(2);
    const rate = scale / this.scale;
    this.scrollTo(
      (tx - this.app.stage.x) * rate - tx,
      (ty - this.app.stage.y) * rate - ty
    );

    this.app.stage.scale.x = scale;
    this.app.stage.scale.y = scale;
    this.scale = scale;
  }

  scroll(dx, dy) {
    this.scrollTo(
      dx - this.app.stage.x,
      dy - this.app.stage.y
    );
  }

  scrollTo(x, y) {
    this.app.stage.x = Math.min(Math.max(-x, this.canvasWidth - this.baseWidth * this.scale), 0);
    this.app.stage.y = Math.min(Math.max(-y, this.canvasHeight - this.baseHeight * this.scale), 0);
  }

  clientCellSize() {
    return this.cellSize * this.scale;
  }

  forcusCell(x, y) {
    const { canvasWidth, canvasHeight } = this;
    const cellSize = this.clientCellSize();
    this.scrollTo(
      x * cellSize - canvasWidth/2 + cellSize/2,
      y * cellSize - canvasHeight/2 + cellSize/2
    );
  }

  fieldCoordinates(clientX, clientY) {
    const cellSize = this.clientCellSize();
    return {
      x: Math.floor((clientX - this.app.stage.x) / cellSize),
      y: Math.floor((clientY - this.app.stage.y) / cellSize),
    };
  }

  clientPositionOfCell(x, y) {
    const cellSize = this.clientCellSize();
    return {
      x: x * cellSize + this.app.stage.x,
      y: y * cellSize + this.app.stage.y
    };
  }

  clientXOfCell(x) {
    const cellSize = this.clientCellSize();
    return x * cellSize + this.app.stage.x;
  }

  clientYOfCell(y) {
    const cellSize = this.clientCellSize();
    return y * cellSize + this.app.stage.y;
  }

  resize(width, height) {
    this.app.renderer.resize(width, height);
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

}
