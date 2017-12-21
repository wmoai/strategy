
import PIXI from '../PIXI.js';
import Component from './Component.js';

const baseStyle = {
  fontSize: 60,
  fontFamily: 'impact',
  dropShadow: true,
  dropShadowBlur: 10,
  dropShadowDistance: 0,
};

const enterDur = 15;
const stopDur = 30;
const outDur = 20;
const totalDur = enterDur + stopDur + outDur;

export default class TurnStart extends Component {

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
    text.y = 200;
    text.visible = false;
    this.container.addChild(text);

    this.components = {
      background,
      text,
    };

    this.elapsed = 0;
    this.visible = false;
    this.animationX = {
      enter: null,
      stop: null,
      out: null,
    };
  }

  setTurn(isMyTurn, width, height) {
    const { components } = this;

    this.animationX.enter = width;
    this.animationX.stop = width / 2;
    this.animationX.out = width / 3;

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

    this.elapsed = 0;
    this.visible = true;
  }

  update(delta) {
    if (this.visible) {
      const { components } = this;
      components.text.visible = true;
      components.background.visible = true;
      if (this.elapsed > totalDur) {
        this.visible = false;
        components.text.visible = false;
        components.background.visible = false;
      }
      this.elapsed += delta;
      this.animate();
      return true;
    }
    return false;
  }

  animate() {
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
