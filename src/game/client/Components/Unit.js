// @flow
import Unit from '../../models/Unit.js';
import Field from '../../models/Field.js';

import PIXI, { resources } from '../PIXI.js';
import Component from './Component.js';

export default class UnitComponent extends Component {
  field: Field;
  cellSize: number;
  sprite: any;
  greenLine: any;

  constructor(model: Unit, field: Field, cellSize: number) {
    super();
    this.field = field;
    this.cellSize = cellSize;

    const margin = cellSize / 10;

    const sprite = new PIXI.Sprite();
    sprite.width = cellSize - margin*2;
    sprite.height = cellSize - margin*2;
    sprite.x = margin;
    sprite.y = margin;
    this.container.addChild(sprite);
    this.sprite = sprite;
    const redLine = new PIXI.Graphics();
    redLine.beginFill(0xdc143c);
    redLine.drawRect(2, cellSize-4, cellSize-4, 2);
    this.container.addChild(redLine);
    const greenLine = new PIXI.Graphics();
    greenLine.beginFill(0x40e0d0);
    greenLine.drawRect(2, cellSize-4, (cellSize-4) * model.state.hp / model.status.hp, 2);
    this.container.addChild(greenLine);
    this.greenLine = greenLine;

    this.update(model);
  }

  update(model: Unit) {
    const { field, cellSize, container, sprite, greenLine } = this;
    if (!model.isAlive()) {
      this.container.visible = false;
      return;
    }
    const { cellId, hp, isActed } = model.state;
    const { y, x } = field.coordinates(cellId);

    container.x = x * cellSize;
    container.y = y * cellSize;
    greenLine.width = (cellSize-4) * hp / model.status.hp;
    const colorI = isActed ? 0 : (!model.isOffense ? 1 : 2);
    sprite.texture = resources.units.get(model.klass.id)[colorI];
  }

}

