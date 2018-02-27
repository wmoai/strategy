// @flow
import Unit from '../../models/Unit.js';
import type { UnitState } from '../../models/Unit.js';
import Field from '../../models/Field.js';

import PIXI, { resources } from '../PIXI.js';
import Component from './Component.js';

export default class UnitComponent extends Component {
  field: Field;
  model: Unit;
  cellSize: number;
  sprite: any;
  greenLine: any;

  constructor(model: Unit, field: Field, cellSize: number) {
    super();
    this.field = field;
    this.model = model;
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
    redLine.drawRect(2, cellSize-4, this.hpBarWidth(), 2);
    this.container.addChild(redLine);
    const greenLine = new PIXI.Graphics();
    greenLine.beginFill(0x40e0d0);
    greenLine.drawRect(2, cellSize-4, this.lifeWidth(model.state.hp), 2);
    this.container.addChild(greenLine);
    this.greenLine = greenLine;

    this.update(model.state);
  }

  hpBarWidth() {
    return this.cellSize - 4;
  }

  lifeWidth(hp: number) {
    return Math.max(this.hpBarWidth() * hp / this.model.status.hp, 0);
  }

  burst() {
    const { cellSize } = this;
    const fire = new PIXI.extras.AnimatedSprite(resources.fires);
    fire.x = cellSize / 2;
    fire.y = cellSize / 2;
    fire.width = cellSize * 3;
    fire.height = cellSize * 3;
    fire.anchor.set(0.5);
    fire.animationSpeed = 0.5;
    fire.loop = false;
    fire.play();
    fire.onComplete = () => {
      this.container.removeChild(fire);
      fire.destroy();
    };
    this.container.addChild(fire);
  }

  heal() {
    const { cellSize } = this;
    const light = new PIXI.extras.AnimatedSprite(resources.lights);
    light.x = cellSize / 2;
    light.y = cellSize / 4;
    light.width = cellSize * 1.5;
    light.height = cellSize * 1.5;
    light.anchor.set(0.5);
    light.animationSpeed = 0.4;
    light.loop = false;
    light.blendMode = PIXI.BLEND_MODES.ADD;
    light.play();
    light.onComplete = () => {
      this.container.removeChild(light);
      light.destroy();
    };
    this.container.addChild(light);
  }
  

  update(state: UnitState) {
    this.model.state = state;
    const { field, model, cellSize, container, sprite, greenLine } = this;
    if (!model.isAlive()) {
      this.container.visible = false;
      return;
    }
    const { cellId, hp, isActed } = state;
    const { y, x } = field.coordinates(cellId);

    container.x = x * cellSize;
    container.y = y * cellSize;
    greenLine.width = this.lifeWidth(hp);
    const colorI = isActed ? 0 : (!model.isOffense ? 1 : 2);
    const unitTexture = resources.units.get(model.klass.id);
    if (unitTexture) {
      sprite.texture = unitTexture[colorI];
    }
  }

}

