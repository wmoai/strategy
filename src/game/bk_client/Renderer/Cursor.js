import PIXI from './PIXI.js';

export default class Cursor {
  constructor(cellSize, layer) {
    this.cellSize = cellSize;
    const left = 0
      , top = 0
      , right = cellSize
      , bottom = cellSize;
    const width = cellSize / 3;
    const size = cellSize / 12;

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xffffff);
    graphics.drawRect(left, top, width, size);
    graphics.drawRect(left, top+size, size, width-size);
    graphics.drawRect(right, top, -width, size);
    graphics.drawRect(right, top+size, -size, width-size);
    graphics.drawRect(right, bottom, -width, -size);
    graphics.drawRect(right, bottom-size, -size, -width+size);
    graphics.drawRect(left, bottom, width, -size);
    graphics.drawRect(left, bottom-size, size, -width+size);
    graphics.visible = false;
    layer.addChild(graphics);
    this.graphics = graphics;
  }

  update(x, y) {
    this.graphics.visible = true;
    this.graphics.x = x * this.cellSize;
    this.graphics.y = y * this.cellSize;
  }
}
