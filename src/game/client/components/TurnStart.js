// @flow
import PIXI from '../PIXI.js';
import Component from './Component.js';
import Updater from '../lib/Updater.js';

const baseStyle = {
  fontSize: 60,
  fontFamily: ['Anton', 'impact'],
  dropShadow: true,
  dropShadowBlur: 10,
  dropShadowDistance: 0,
};

const enterDur = 15;
const stopDur = 30;
const outDur = 20;
const totalDur = enterDur + stopDur + outDur;

export default class TurnStart extends Component {
  components: {
    background: any,
    text: any,
  };
  elapsed: number;
  animationX: {
    enter: number,
    stop: number,
    out: number,
  };

  constructor() {
    super();

    const background = new PIXI.Graphics();
    background.beginFill(0x000000, 0.5);
    background.drawRect(0, 0, 1, 1);
    background.visible = false;
    this.container.addChild(background);

    const text = new PIXI.Text();
    text.anchor.x = 0.5;
    text.anchor.y = 0.5;
    text.visible = false;
    this.container.addChild(text);

    this.components = {
      background,
      text,
    };

    this.elapsed = 0;
    this.animationX = {
      enter: 0,
      stop: 0,
      out: 0,
    };
  }

  createUpdater(isMyTurn: boolean, width: number, height: number) {
    const { components } = this;

    this.animationX.enter = width;
    this.animationX.stop = width / 2;
    this.animationX.out = width / 3;

    components.text.y = height / 5 * 2;
    components.text.x = width * 2;
    if (isMyTurn) {
      components.text.text = 'YOUR TURN';
      components.text.style = {
        ...baseStyle,
        fill: '#ccc',
        dropShadowColor: 'black',
      };
    } else {
      components.text.text = 'ENEMY TURN';
      components.text.style ={
        ...baseStyle,
        fill: '#222',
        dropShadowColor: 'white',
      };
    }
    components.background.width = width;
    components.background.height = height;
    components.text.visible = true;
    components.background.visible = true;

    this.elapsed = 0;

    return new Updater(totalDur, delta => {
      this.animate(delta);
    });
  }

  animate(delta: number) {
    this.elapsed += delta;
    const { elapsed, components, animationX } = this;
    if (elapsed < enterDur) {
      const { enter, stop } = animationX;
      const d = elapsed / enterDur;
      components.text.x = enter - (stop - enter) * d * (d-2);
      components.background.alpha = d;
      components.text.alpha = d;
    } else if (elapsed > enterDur + stopDur) {
      const { stop, out } = animationX;
      const d = (elapsed - (enterDur + stopDur)) / outDur;
      components.text.x = stop + (out - stop) * d * d;
      components.background.alpha = 1 - d;
      components.text.alpha = 1 - d;
    }
  }

}
