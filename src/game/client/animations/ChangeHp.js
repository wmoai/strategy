// @flow
import PIXI from '../PIXI.js';
import Animation from './Animation.js';
import UnitComponent from '../components/Unit.js';

export default class ChangeHP extends Animation {
  unit: UnitComponent;
  beforeWidth: number;
  afterWidth: number;
  missText: any;

  constructor({ unit, width }: {
    unit: UnitComponent,
    width: number,
  }) {
    super({ 
      container: unit.container,
      duration: 20
    });
    this.wait = 10;
    this.unit = unit;
    this.beforeWidth = unit.greenLine.width;
    this.afterWidth = width;
    if (this.beforeWidth === this.afterWidth) {
      this.duration = 40;
      const text = new PIXI.Text();
      text.anchor.x = 0.5;
      text.anchor.y = 0.5;
      text.x = this.container.width / 2;
      text.y = this.container.height / 2;
      text.text = 'Miss';
      text.style = {
        fontSize: 16,
        fontFamily: ['Anton', 'impact'],
        fill: '#2f4f4f',
        stroke: '#eee',
        strokeThickness: 3,
      };
      this.before = () => {
        this.container.addChild(text);
      };
      this.after = () => {
        this.container.removeChild(text);
      };
    } else {
      const isDamage = this.beforeWidth > this.afterWidth;
      if (isDamage) {
        this.before = () => {
          unit.burst();
        };
      } else {
        this.before = () => {
          unit.heal();
        };
      }
    }
  }

  animate() {
    const { unit, beforeWidth, afterWidth, duration } = this;
    if (this.isEnd) {
      this.missText = null;
      unit.greenLine.width = afterWidth;
    } else {
      const r = this.elapsed / duration;
      unit.greenLine.width = beforeWidth + (afterWidth - beforeWidth) * r;
    }
  }

}
