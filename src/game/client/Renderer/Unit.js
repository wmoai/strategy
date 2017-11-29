import PIXI, { resources } from './PIXI.js';
import Animation from './Animation.js';

export default class Unit {
  constructor(unit, field, cellSize, layer) {
    this.field = field;
    this.cellSize = cellSize;
    this.animations = [];

    const margin = cellSize / 10;
    if (!unit.isAlive()) {
      return;
    }
    const { y, x } = field.coordinates(unit.cellId);

    const container = new PIXI.Container();

    const colorI = unit.acted ? 0 : (!unit.offense ? 1 : 2);
    const texture = resources.units.get(unit.klass.id)[colorI];
    const chara = new PIXI.Sprite(texture);
    chara.cacheAsBitmap = true;
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
    greenLine.drawRect(2, cellSize-4, cellSize-4, 2);
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
    if (this.animations.length > 0) {
      return;
    }
    const { y, x } = field.coordinates(unit.cellId);

    this.container.x = x * cellSize;
    this.container.y = y * cellSize;
    this.greenLine.width = (cellSize-4) * unit.hp / unit.status.hp;
    const colorI = unit.acted ? 0 : (!unit.offense ? 1 : 2);
    this.chara.cacheAsBitmap = false;
    this.chara.texture = resources.units.get(unit.klass.id)[colorI];
    this.chara.cacheAsBitmap = true;
  }

  setMoveAnimation(route, callback) {
    if (route.length < 2) {
      if (callback) {
        return callback();
      }
    }
    const { field, cellSize } = this;
    const first = route.shift();
    const firstC = field.coordinates(first);
    let cx = firstC.x * cellSize;
    let cy = firstC.y * cellSize;
    this.animations = route.map(cellId => {
      const sx = cx;
      const sy = cy;
      const nextC = field.coordinates(cellId);
      const ex = nextC.x * cellSize;
      const ey = nextC.y * cellSize;
      cx = ex;
      cy = ey;
      return new Animation({
        sx,
        sy,
        ex,
        ey,
        duration: 4,
      });
    });
    this.animationCallback = callback;
  }

  updateAnimation(delta) {
    if (!this.animation) {
      if (this.animations.length == 0) {
        return;
      }
      this.animation = this.animations.shift();
    }
    this.animation.update(delta);
    this.container.x = this.animation.x;
    this.container.y = this.animation.y;
    if (this.animation.isEnd) {
      this.animation = null;
      if (this.animations.length == 0) {
        if (this.animationCallback && typeof this.animationCallback === 'function') {
          this.animationCallback();
        }
      }
    }
  }

  omitCurrenAnimation() {
    let animation = this.animations.length == 0 ? this.animation : this.animations.pop();
    if (!animation) {
      return;
    }
    this.container.x = animation.ex;
    this.container.y = animation.ey;

    this.animation = null;
    this.animations = [];
  }

}
