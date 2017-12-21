import PIXI, { resources } from '../PIXI.js';
import Component from './Component.js';

export default class Unit extends Component {
  constructor(unit, field, cellSize) {
    super();
    this.field = field;
    this.cellSize = cellSize;

    this.isOffense = unit.isOffense;
    this.maxHp = unit.status.hp;
    this.klassId = unit.klass.id;

    const margin = cellSize / 10;
    const { y, x } = field.coordinates(unit.cellId);


    const colorI = unit.isActed ? 0 : (!this.isOffense ? 1 : 2);
    const texture = resources.units.get(unit.klass.id)[colorI];
    const chara = new PIXI.Sprite(texture);
    chara.width = cellSize - margin*2;
    chara.height = cellSize - margin*2;
    chara.x = margin;
    chara.y = margin;
    this.container.addChild(chara);
    const redLine = new PIXI.Graphics();
    redLine.beginFill(0xdc143c);
    redLine.drawRect(2, cellSize-4, cellSize-4, 2);
    this.container.addChild(redLine);
    const greenLine = new PIXI.Graphics();
    greenLine.beginFill(0x40e0d0);
    greenLine.drawRect(2, cellSize-4, (cellSize-4) * unit.hp / unit.status.hp, 2);
    this.container.addChild(greenLine);

    this.container.x = x * cellSize;
    this.container.y = y * cellSize;

    this.greenLine = greenLine;
    this.chara = chara;
  }

  update(unit) {
    const { field, cellSize } = this;
    if (!unit.isAlive()) {
      this.container.visible = false;
      return;
    }
    const { y, x } = field.coordinates(unit.cellId);

    this.container.x = x * cellSize;
    this.container.y = y * cellSize;
    this.greenLine.width = (cellSize-4) * unit.hp / unit.status.hp;
    const colorI = unit.isActed ? 0 : (!unit.isOffense ? 1 : 2);
    this.chara.texture = resources.units.get(unit.klass.id)[colorI];
  }

}
