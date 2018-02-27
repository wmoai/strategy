// @flow

import PIXI from '../PIXI.js';
import Component from './Component.js';

export default class CursorComponent extends Component {
  cellSize: number;

  constructor(cellSize: number) {
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
    this.container.x = -cellSize;
    this.container.y = -cellSize;
  }

  update(x: number, y: number) {
    const { container, cellSize } = this;
    container.x = x * cellSize;
    container.y = y * cellSize;
  }

}
