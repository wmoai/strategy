import PIXI from './PIXI.js';

import Game from './Components/Game.js';
import TurnStart from './Components/TurnStart.js';


export default function createRenderer({ width, height, view, cellSize, gameModel, isOffense, isSolo }) {

  const application = new PIXI.Application({
    width,
    height,
    view,
    sharedLoader: true,
  });

  const components = {
    turnStart: new TurnStart(),
    game:  new Game({
      renderer: this.app.renderer,
      gameModel,
      cellSize,
      isOffense,
      isSolo,
    })
  };

  const container = new PIXI.Container();
  this.layer = {
    main: new PIXI.Container(),
    overlay: new PIXI.Container(),
  };
  container.addChild(this.layer.main);
  container.addChild(this.layer.overlay);
  application.stage = container;


  function update(state) {

  }

  return {
    update
  };
}

