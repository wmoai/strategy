import PIXI, { preload } from './PIXI.js';

import Game from './Components/Game/';

export default class Client {

  static preload() {
    return preload();
  }

  constructor({ canvas, cellSize, width, height, game, isOffense, socket, isSolo=false }) {
    const { field } = game;
    this.fullWidth = field.width * cellSize;
    this.fullHeight = field.height * cellSize;
    this.cellSize = cellSize;
    this.scale = 1;
    this.app = new PIXI.Application({
      width,
      height,
      view: canvas,
      sharedLoader: true,
    });

    this.game = new Game({
      game,
      cellSize,
      isOffense,
      stage: this.app.stage,
      isSolo,
    });
    this.run();

    this.app.stage.interactive = true;
    this.app.stage.on('mousemove', e => {
      this.game.hoverCell(this.fieldCoordinates(e.data.global.x, e.data.global.y));
    });
    this.app.stage.on('click', e => {
      this.game.selectCell(this.fieldCoordinates(e.data.global.x, e.data.global.y), (from, to, target) => {
        if (!socket) {
          return;
        }
        socket.emit('act', {
          from: from,
          to: to,
          target: target
        });
      });
    });
    if (socket) {
      socket.on('syncGame', payload => {
        this.game.sync(payload.game, payload.action);
      });
    }
  }

  run() {
    /*
    let angle = 0;
    let amp = 0.1;
    let alpha = 1 - amp;
    this.app.ticker.add(delta => {
      angle = (angle + 3) % 360;
      const diff = Math.sin(angle * Math.PI / 180);
      this.layer.range.alpha = alpha + diff * amp;

      // this.updateCursor();
      this.updateAnimation(delta);
      if (!this.animation) {
        // this.updateUnits();
      }
      this.decelerateScroll(delta);
    });
    */
    this.app.ticker.add(delta => {
      this.game.updateScreen(delta);
      this.decelerateScroll(delta);
    });

  }

  // listen(socket) {
    // socket.on('syncUnits', payload => {
      // payload.units.forEach(data => {
        // const { seq } = data;
        // const unit = this.components.units.get(seq);
        // unit.update2(data);
      // });
    // });
    // this.socket = socket;
  // }

  updateAnimation(delta) {
    if (this.animation) {
      this.stopScroll();
      this.animation.update(delta);
      this.followUnit(this.animation.container);
      if (this.animation.isEnd) {
        this.animation = null;
      }
    }
  }








  zoom(delta, tx, ty) {
    const scale = Math.max(0.8, Math.min(1.8, this.scale - delta)).toFixed(2);
    const rate = scale / this.scale;
    this.app.stage.scale.x = scale;
    this.app.stage.scale.y = scale;
    this.scale = scale;
    this.scrollTo(
      (tx - this.app.stage.x) * rate - tx,
      (ty - this.app.stage.y) * rate - ty
    );
  }

  scroll(dx, dy) {
    this.scrollTo(
      dx - this.app.stage.x,
      dy - this.app.stage.y
    );
  }

  scrollTo(x, y) {
    const { app, fullWidth, fullHeight, scale } = this;
    const maxX = fullWidth * scale - app.renderer.width;
    const maxY = fullHeight * scale - app.renderer.height;
    this.app.stage.x = (
      (maxX < 0)
      ? -maxX / 2
      : -Math.max(Math.min(x, maxX), 0)
    );
    this.app.stage.y = -Math.max(Math.min(y, maxY), 0);
  }

  endScroll(vx, vy) {
    this.scrollVX = vx;
    this.scrollVY = vy;
  }

  decelerateScroll(delta) {
    if (!this.scrollVX && !this.scrollVY) {
      return;
    }
    this.scroll(this.scrollVX, this.scrollVY);
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

  forcusCell(x, y) {
    const { cellSize, app, scale } = this;
    this.scrollTo(
      (x * cellSize + cellSize/2) * scale - app.renderer.width/2,
      (y * cellSize + cellSize/2) * scale - app.renderer.height/2
    );

  }

  followUnit(container) {
    const { app, scale } = this;
    const cellSize = this.clientCellSize();
    const ax = container.x * scale;
    const ay = container.y * scale;
    const sx = this.app.stage.x;
    const sy = this.app.stage.y;
    const overX = ax + cellSize + sx - app.renderer.width;
    const underX = ax + sx;
    const overY = ay + cellSize + sy - app.renderer.height;
    const underY = ay + sy;

    let dx = overX > 0 ? overX : underX < 0 ? underX : 0;
    let dy = overY > 0 ? overY : underY < 0 ? underY : 0;
    this.scroll(dx, dy);
  }

  clientCellSize() {
    return this.cellSize * this.scale;
  }

  fieldCoordinates(clientX, clientY) {
    const cellSize = this.clientCellSize();
    return {
      x: Math.floor((clientX - this.app.stage.x) / cellSize),
      y: Math.floor((clientY - this.app.stage.y) / cellSize),
    };
  }

  clientPositionOfCell(x, y) {
    const cellSize = this.clientCellSize();
    return {
      x: x * cellSize + this.app.stage.x,
      y: y * cellSize + this.app.stage.y
    };
  }

  clientXOfCell(x) {
    const cellSize = this.clientCellSize();
    return x * cellSize + this.app.stage.x;
  }

  clientYOfCell(y) {
    const cellSize = this.clientCellSize();
    return y * cellSize + this.app.stage.y;
  }

  resize(width, height) {
    this.app.renderer.resize(width, height);
  }



}

