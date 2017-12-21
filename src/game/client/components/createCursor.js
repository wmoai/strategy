import PIXI from '../PIXI.js';

export default (cellSize) => {
  const left = 0
    , top = 0
    , right = cellSize
    , bottom = cellSize;
  const width = cellSize / 3;
  const size = cellSize / 12;

  const container = new PIXI.Container();

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
  container.addChild(graphics);
  container.visible = false;

  function update(x, y) {
    container.visible = true;
    container.x = x * cellSize;
    container.y = y * cellSize;
  }

  return {
    update,
    container,
  };

};
