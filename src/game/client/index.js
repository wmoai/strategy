// @flow
import PIXI, { preload } from './PIXI.js';

import Touch from './lib/Touch.js';

import Game from './components/Game.js';
import SoloGame from './components/SoloGame.js';

import GameModel from '../models/Game.js';

const Events = {
  hoverterrain: 'hovercell',
  hoverunit: 'hoverunit',
  hover: 'hover',
  forecast: 'forecast',
  changeturn: 'changeturn',
  endgame: 'endgame',
};

export default class Client {
  fullWidth: number;
  fullHeight: number;
  cellSize: number;
  scale: number;
  socket: any;
  isEmitted: boolean;
  app: any;
  components: {
    game: Game,
  };
  touch: Touch;
  scrollVX: number;
  scrollVY: number;
  eventListeners: Array<{
    type: string,
    callback: any => void,
  }>;


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
  } : {
    canvas: HTMLCanvasElement,
    cellSize: number,
    width: number,
    height: number,
    game: GameModel,
    isOffense: boolean,
    isSolo?: boolean,
    socket: any,
  }) {
    const { field } = game;
    this.fullWidth = field.width * cellSize;
    this.fullHeight = field.height * cellSize;
    this.cellSize = cellSize;
    this.scale = 1;
    this.socket = socket;
    this.isEmitted = false;
    this.app = new PIXI.Application({
      width,
      height,
      view: canvas,
      sharedLoader: true,
    });

    const gameComponent = !isSolo ?
      new Game({
        renderer: this.app.renderer,
        game,
        cellSize,
        isOffense,
        isSolo,
      }) : new SoloGame({
        renderer: this.app.renderer,
        game,
        cellSize,
        isOffense,
      });


    this.components = {
      game: gameComponent,
    };

    const container = new PIXI.Container();
    container.addChild(this.components.game.container);
    this.app.stage = container;

    this.eventListeners = [];
  }

  run() {
    const { app, components } = this;
    const { game } = components;

    this.listen();

    let hoveredCell;
    app.ticker.add(delta => {
      this.decelerateScroll(delta);
      if (hoveredCell != game.hoveredCell()) {
        hoveredCell = game.hoveredCell();
        this.kickEvent(Events.hover, {
          unit: game.hoveredUnit(),
          terrain: game.hoveredTerrain(),
          forecast: game.forecast(),
        });
      }
      if (!this.isEmitted) {
        game.update(delta);
      }
    });
  }

  listen() {
    const { app, components, socket } = this;
    const { game } = components;

    game.onChangeTurn = (turn, turnRemained) => {
      this.kickEvent(Events.changeturn, {
        turn,
        turnRemained,
      });
    };
    game.onTimeOut = () => {
      this.endTurn();
    };
    game.onEnd = winner => {
      this.kickEvent(Events.endgame, winner);
      return this.app.ticker.stop();
    };

    this.touch = new Touch({
      onClick: (x, y) => {
        if (game.model.state.isEnd) {
          return;
        }
        game.select(x, y, (from, to, target) => {
          if (!socket) {
            return;
          }
          this.isEmitted = true;
          socket.emit('act', {
            from: from,
            to: to,
            target: target
          });
        });
      },
      onDrag: (dx, dy) => {
        if (game.model.state.isEnd) {
          return;
        }
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
    app.stage.on('touchstart', e => {
      this.touch.start(e.data.global.x, e.data.global.y);
      game.hover(e.data.global.x, e.data.global.y);
    });

    app.stage.on('mousemove', e => {
      if (game.model.state.isEnd) {
        return;
      }
      this.touch.move(e.data.global.x, e.data.global.y);
      game.hover(e.data.global.x, e.data.global.y);
    });
    app.stage.on('touchmove', e => {
      if (game.model.state.isEnd) {
        return;
      }
      this.touch.move(e.data.global.x, e.data.global.y);
      game.hover(e.data.global.x, e.data.global.y);
    });
    app.stage.on('mouseup', () => {
      this.touch.end();
    });
    app.stage.on('mouseout', () => {
      this.touch.end();
    });
    app.stage.on('touchend', () => {
      this.touch.end();
    });

    if (socket) {
      socket.on('syncGame', payload => {
        this.isEmitted = false;
        game.sync(payload.game, payload.action);
      });
      this.isEmitted = true;
      socket.emit('syncGame');
    }
  }

  endTurn() {
    this.components.game.endMyTurn(() => {
      this.isEmitted = true;
      this.socket.emit('endTurn');
    });
  }

  destroy() {
    const { socket, app } = this;
    if (socket) {
      socket.socket.removeAllListeners('syncGame');
    }
    if (app) {
      app.destroy();
    }
  }

  zoom(delta: number) {
    this.components.game.zoom(delta);
  }

  endScroll(vx: number, vy: number) {
    this.scrollVX = vx;
    this.scrollVY = vy;
  }

  decelerateScroll(delta: number) {
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

  clientCellSize() {
    return this.cellSize * this.scale;
  }

  resize(width: number, height: number) {
    this.app.renderer.resize(width, height);
    this.components.game.scroll(0, 0);
  }


  addEventListener(type: string, callback: any => void) {
    this.eventListeners.push({ type, callback });
  }

  kickEvent(type: string, ...args: Array<any>) {
    this.eventListeners.forEach(eventListener => {
      if (eventListener.type == type) {
        eventListener.callback(...args);
      }
    });
  }

}
