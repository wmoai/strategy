import PIXI, { resources, preload } from './PIXI.js';

import Cursor from './Cursor.js';
import Unit from './Unit.js';
import MoveUnitAnimation from './MoveUnitAnimation.js';

export default class Renderer {

  static preload() {
    return preload();
  }

  constructor({ canvas, game, cellSize, width, height }) {
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
    this.synchronous = {
      units: null, // { unitSeq: { cellId, hp } }
    };

    this.cursor = new Cursor(cellSize, this.layer.ui);
    this.unitsMap = new Map();
    // this.setUnits(game.units);
    this.initUnits(game.units);
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

  destroy() {
    this.app.destroy();
  }

  setMoveAnimation(unitModel, route, callback) {
    if (this.animation) {
      this.animation.omit();
    }
    if (!unitModel) {
      return;
    }
    const { game, cellSize } = this;
    const { field } = game;

    const unit = this.unitsMap.get(unitModel.seq);
    this.animation = new MoveUnitAnimation(unit.container, route, field, cellSize, callback);
  }

  updateAnimation(delta) {
    if (this.animation) {
      this.stopScroll();
      this.animation.update(delta);
      this.followUnit(this.animation.container);
      if (this.animation.isEnd) {
        this.animation = null;
      }
    }
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

  setCursor(x, y) {
    this.buffers.cursor = { x, y };
  }

  updateCursor() {
    if (this.buffers.cursor) {
      const { x, y } = this.buffers.cursor;
      this.buffers.cursor = null;
      this.cursor.update(x, y);
    }
  }




  moveUnit() {

  }


  listen(socket) {
    socket.on('syncUnits', payload => {
      payload.units.forEach(data => {
        const { seq } = data;
        const unit = this.unitsMap.get(seq);
        unit.update2(data);
      });
    });
    this.socket = socket;
  }



  initUnits(units) {
    const { game, cellSize } = this;
    units.forEach(unitModel => {
      const unit = new Unit(unitModel, game.field, cellSize, this.layer.units);
      this.unitsMap.set(unitModel.seq, unit);
      // unit.update(unitModel);
    });
  }

  setUnits(units) {
    this.buffers.units = units;
  }

  updateUnits() {
    if (this.buffers.units) {
      this.buffers.units.forEach(unitModel => {
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
  }

  setRanges(ranges, unit) {
    this.buffers.ranges = { ranges, unit };
  }

  updateRanges() {
    if (!this.buffers.ranges) {
      return;
    }
    const { ranges, unit } = this.buffers.ranges;
    this.buffers.ranges = null;
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
    const scale = Math.max(0.8, Math.min(1.8, this.scale - delta)).toFixed(2);
    const rate = scale / this.scale;
    this.app.stage.scale.x = scale;
    this.app.stage.scale.y = scale;
    this.scale = scale;
    this.scrollTo(
      (tx - this.app.stage.x) * rate - tx,
      (ty - this.app.stage.y) * rate - ty
    );
  }

  scroll(dx, dy) {
    this.scrollTo(
      dx - this.app.stage.x,
      dy - this.app.stage.y
    );
  }

  scrollTo(x, y) {
    const { app, fullWidth, fullHeight, scale } = this;
    const maxX = fullWidth * scale - app.renderer.width;
    const maxY = fullHeight * scale - app.renderer.height;
    this.app.stage.x = (
      (maxX < 0)
      ? -maxX / 2
      : -Math.max(Math.min(x, maxX), 0)
    );
    this.app.stage.y = -Math.max(Math.min(y, maxY), 0);
  }

  endScroll(vx, vy) {
    this.scrollVX = vx;
    this.scrollVY = vy;
  }

  decelerateScroll(delta) {
    if (!this.scrollVX && !this.scrollVY) {
      return;
    }
    this.scroll(this.scrollVX, this.scrollVY);
    this.scrollVX *= 0.95 * delta;
    this.scrollVY *= 0.95 * delta;
    if (Math.abs(this.scrollVX) < 1 && Math.abs(this.scrollVY) < 1) {
      this.stopScroll();
    }
  }

  stopScroll() {
    this.scrollVX = 0;
    this.scrollVY = 0;
  }

  forcusCell(x, y) {
    const { cellSize, app, scale } = this;
    this.scrollTo(
      (x * cellSize + cellSize/2) * scale - app.renderer.width/2,
      (y * cellSize + cellSize/2) * scale - app.renderer.height/2
    );

  }

  followUnit(container) {
    const { app, scale } = this;
    const cellSize = this.clientCellSize();
    const ax = container.x * scale;
    const ay = container.y * scale;
    const sx = this.app.stage.x;
    const sy = this.app.stage.y;
    const overX = ax + cellSize + sx - app.renderer.width;
    const underX = ax + sx;
    const overY = ay + cellSize + sy - app.renderer.height;
    const underY = ay + sy;

    let dx = overX > 0 ? overX : underX < 0 ? underX : 0;
    let dy = overY > 0 ? overY : underY < 0 ? underY : 0;
    this.scroll(dx, dy);
  }

  clientCellSize() {
    return this.cellSize * this.scale;
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
  }

}
