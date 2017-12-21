import PIXI, { preload } from './PIXI.js';

import Touch from './lib/Touch.js';

import Game from './components/Game.js';
import TurnStart from './components/TurnStart.js';

const Events = {
  hoverterrain: 'hovercell',
  hoverunit: 'hoverunit',
  hover: 'hover',
  forecast: 'forecast',
  changeturn: 'changeturn',
};

export default class Client {

  static preload() {
    return preload();
  }

  constructor({
    canvas,
    cellSize,
    width,
    height,
    game,
    isOffense,
    isSolo=false,
    socket,
  }) {
    const { field } = game;
    this.fullWidth = field.width * cellSize;
    this.fullHeight = field.height * cellSize;
    this.cellSize = cellSize;
    this.scale = 1;
    this.socket = socket;
    this.app = new PIXI.Application({
      width,
      height,
      view: canvas,
      sharedLoader: true,
    });

    this.components = {
      turnStart: new TurnStart(),
      game:  new Game({
        renderer: this.app.renderer,
        game,
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
    this.app.stage = container;


    this.layer.overlay.addChild(this.components.turnStart.container);
    this.layer.main.addChild(this.components.game.container);

    this.eventListeners = [];
  }

  run() {
    const { app, components, socket } = this;
    const { game, turnStart } = components;

    this.touch = new Touch({
      onClick: (x, y) => {
        game.select(x, y, (from, to, target) => {
          if (!socket) {
            return;
          }
          socket.emit('act', {
            from: from,
            to: to,
            target: target
          });
        });
      },
      onDrag: (dx, dy) => {
        game.scroll(dx, dy);
      },
      onEndDrag: (vx, vy) => {
        this.endScroll(vx, vy);
      },
    });

    app.stage.interactive = true;
    app.stage.on('mousedown', e => {
      this.touch.start(e.data.global.x, e.data.global.y);
    });
    app.stage.on('mousemove', e => {
      this.touch.move(e.data.global.x, e.data.global.y);
      game.hover(e.data.global.x, e.data.global.y);
    });
    app.stage.on('mouseup', () => {
      this.touch.end();
    });
    app.stage.on('mouseout', () => {
      this.touch.end();
    });

    if (socket) {
      socket.on('syncGame', payload => {
        game.sync(payload.game, payload.action);
      });
    }

    let hoveredCell, turn;
    app.ticker.add(delta => {
      this.decelerateScroll(delta);
      if (turnStart.update(delta)) {
        return;
      }
      if (game.update(delta)) {
        return;
      }

      if (hoveredCell != game.hoveredCell()) {
        hoveredCell = game.hoveredCell();
        this.kickEvent(Events.hover, {
          unit: game.hoveredUnit(),
          terrain: game.hoveredTerrain(),
          forecast: game.forecast(),
        });
      }

      const turnInfo = game.turnInfo();
      if (turn != turnInfo.turn) {
        turn = turnInfo.turn;
        this.kickEvent(Events.changeturn, {
          turnRemained: turnInfo.remained
        });
        turnStart.setTurn(
          game.isMyTurn(),
          app.renderer.width,
          app.renderer.height,
        );
      }

      game.mightActAI();
    });

  }

  zoom(delta) {
    this.components.game.zoom(delta);
  }

  endScroll(vx, vy) {
    this.scrollVX = vx;
    this.scrollVY = vy;
  }

  decelerateScroll(delta) {
    if (!this.scrollVX && !this.scrollVY) {
      return;
    }
    this.components.game.scroll(this.scrollVX, this.scrollVY);
    this.scrollVX *= 0.95 * delta;
    this.scrollVY *= 0.95 * delta;
    if (Math.abs(this.scrollVX) < 1 && Math.abs(this.scrollVY) < 1) {
      this.stopScroll();
    }
  }

  stopScroll() {
    this.scrollVX = 0;
    this.scrollVY = 0;
  }

  // forcusCell(x, y) {
    // const { cellSize, app, scale } = this;
    // this.scrollTo(
      // (x * cellSize + cellSize/2) * scale - app.renderer.width/2,
      // (y * cellSize + cellSize/2) * scale - app.renderer.height/2
    // );
  // }

  clientCellSize() {
    return this.cellSize * this.scale;
  }

  fieldCoordinates(clientX, clientY) {
    const cellSize = this.clientCellSize();
    return {
      x: Math.floor((clientX - this.layer.main.x) / cellSize),
      y: Math.floor((clientY - this.layer.main.y) / cellSize),

    };
  }

  clientPositionOfCell(x, y) {
    const cellSize = this.clientCellSize();
    return {
      x: x * cellSize + this.layer.main.x,
      y: y * cellSize + this.layer.main.y

    };
  }

  clientXOfCell(x) {
    const cellSize = this.clientCellSize();
    return x * cellSize + this.layer.main.x;
  }

  clientYOfCell(y) {
    const cellSize = this.clientCellSize();
    return y * cellSize + this.layer.main.y;
  }

  resize(width, height) {
    this.app.renderer.resize(width, height);
    this.components.game.scroll(0, 0);
  }


  addEventListener(type, callback) {
    this.eventListeners.push({ type, callback });
  }

  kickEvent(type, ...args) {
    this.eventListeners.forEach(eventListener => {
      if (eventListener.type == type) {
        eventListener.callback(...args);
      }
    });
  }


}
