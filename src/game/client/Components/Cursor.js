import PIXI from '../PIXI.js';
import Component from './Component.js';

export default class Cursor extends Component {
  constructor(cellSize) {
    super();
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
    this.container.addChild(graphics);
    this.container.visible = false;
  }

  update(x, y) {
    this.container.visible = true;
    this.container.x = x * this.cellSize;
    this.container.y = y * this.cellSize;
  }
}
