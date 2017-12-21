// @flow

import PIXI, { resources } from '../PIXI.js';

export default (model: any, field: any, cellSize: number) => {

  const margin = cellSize / 10;
  const container = new PIXI.Container();

  const chara = new PIXI.Sprite();
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
  greenLine.drawRect(2, cellSize-4, (cellSize-4) * model.getState().hp / model.status.hp, 2);
  container.addChild(greenLine);


  function update(model: any) {
    if (!model.isAlive()) {
      container.visible = false;
      return;
    }
    const { cellId, hp, isActed } = model.getState();
    const { y, x } = field.coordinates(cellId);

    container.x = x * cellSize;
    container.y = y * cellSize;
    greenLine.width = (cellSize-4) * hp / model.status.hp;
    const colorI = isActed ? 0 : (!model.isOffense ? 1 : 2);
    chara.texture = resources.units.get(model.klass.id)[colorI];
  }
  update(model);

  return {
    container,
    update,
  };
};
