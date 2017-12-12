import PIXI, { resources } from './PIXI.js';

export default class Unit {
  constructor(unit, field, cellSize, layer) {
    this.field = field;
    this.cellSize = cellSize;

    this.isOffense = unit.offense;
    this.maxHp = unit.status.hp;
    this.klassId = unit.klass.id;

    const margin = cellSize / 10;
    const { y, x } = field.coordinates(unit.cellId);

    const container = new PIXI.Container();

    const colorI = unit.acted ? 0 : (!this.isOffense ? 1 : 2);
    const texture = resources.units.get(unit.klass.id)[colorI];
    const chara = new PIXI.Sprite(texture);
    chara.width = cellSize - margin*2;
    chara.height = cellSize - margin*2;
    chara.x = margin;
    chara.y = margin;
    container.addChild(chara);
    const redLine = new PIXI.Graphics();
    redLine.beginFill(0xdc143c);
    redLine.drawRect(2, cellSize-4, cellSize-4, 2);
    container.addChild(redLine);
    const greenLine = new PIXI.Graphics();
    greenLine.beginFill(0x40e0d0);
    // greenLine.drawRect(2, cellSize-4, cellSize-4, 2);
    greenLine.drawRect(2, cellSize-4, (cellSize-4) * unit.hp / unit.status.hp, 2);
    container.addChild(greenLine);

    container.x = x * cellSize;
    container.y = y * cellSize;

    layer.addChild(container);

    this.container = container;
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
    const colorI = unit.acted ? 0 : (!unit.offense ? 1 : 2);
    this.chara.texture = resources.units.get(unit.klass.id)[colorI];
  }

  update2({ hp, cellId, acted }) {
    const { field, cellSize } = this;
    if (hp < 1) {
      this.container.visible = false;
      return;
    }
    const { y, x } = field.coordinates(cellId);

    this.container.x = x * cellSize;
    this.container.y = y * cellSize;
    this.greenLine.width = (cellSize-4) * hp / this.maxHp;
    const colorI = acted ? 0 : (!this.isOffense ? 1 : 2);
    this.chara.texture = resources.units.get(this.klassId)[colorI];
  }

}
