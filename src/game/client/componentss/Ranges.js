// @flow

import PIXI from '../PIXI.js';
import Component from './Component.js';
import Ranges from '../lib/Ranges.js';

export default class RangesComponent extends Component {

  constructor(ranges: Ranges, cellSize: number) {
    super();
    const { game, unit } = ranges;
    const isHealer = !!unit.klass.healer;

    const actionables = ranges.getActionables();
    const movables = ranges.getMovables();

    if (actionables) {
      actionables.filter(cid => !movables || !movables.includes(cid)).map(cid => {
        const { y, x } = game.field.coordinates(cid);
        const color = isHealer ? 0x87ceeb : 0xffd700;
        const highlight = new PIXI.Graphics();
        highlight.beginFill(color, 0.5);
        highlight.lineStyle(1, color);
        highlight.drawRect(x*cellSize, y*cellSize, cellSize, cellSize);
        this.container.addChild(highlight);
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
        this.container.addChild(highlight);
      });
    }
  }

}
