import PIXI from '../PIXI.js';
import Component from './Component.js';

class Info {
  constructor() {
    this.isMovable = false;
    this.distance = Infinity;
    this.movablePrev = null;
    this.isActionable = false;
    this.actionableFrom = [];
  }
}


export default class Ranges extends Component {

  constructor(game) {
    super();
    this.game = game;
    this.map = new Map();
    this.isHealer = false;
  }

  calculate(fromCellId, unit, isFull=false) {
    const { game } = this;
    const { field } = game;
    const { status, klass } = unit;
    this.isHealer = unit.klass.healer;
    this.setMovable(unit, fromCellId);

    const ds = field.terrain.map((terrain, i) => {
      return i == fromCellId ? 0 : Infinity;
    });
    const qs = Object.keys(ds);

    for(let l=0; l<5000; l++) {
      if (qs.length == 0) {
        break;
      }
      let minD = Infinity;
      let u;
      let spliceI;
      qs.forEach((q, i) => {
        if (minD > ds[q]) {
          minD = ds[q];
          u = Number(q);
          spliceI = i;
        }
      });
      if (u == null || (!isFull && ds[u] > status.move)) {
        break;
      }
      qs.splice(spliceI, 1)[0];
      [u-field.width, u-1, u+1, u+field.width].forEach(v => {
        const { y, x } = field.coordinates(v);
        if (!field.isActiveCell(y, x)) {
          return;
        }
        const newD = ds[u] + field.cost(v, klass.move);
        const aunit = game.unit(v);
        if (aunit && unit.isOffense != aunit.isOffense) {
          return this.setDistance(v, newD, u);
        }
        if (ds[v] <= newD || (!isFull && newD > status.move)) {
          return;
        }
        ds[v] = newD;
        if (isFull && newD > status.move) {
          return this.setDistance(v, newD, u);
        }
        this.setMovable(unit, v, {
          distance: newD,
          prev: u
        });
      });
    }
  }

  info(cellId) {
    let info = this.map.get(cellId);
    if (!info) {
      info = new Info();
    }
    return info;
  }

  setDistance(cellId, distance, prev) {
    const info = this.info(cellId);
    if (distance < info.distance) {
      this.map.set(cellId, {
        ...info,
        distance,
        movablePrev: prev
      });
    }
  }

  getDistance(cellId) {
    return this.info(cellId).distance;
  }

  setMovable(unit, cellId, options) {
    const { field } = this.game;
    let distance = 0,
      prev = null;
    if (options) {
      distance = options.distance;
      prev = options.prev;
    }
    const info = this.info(cellId);
    this.map.set(cellId, {
      ...info,
      isMovable: true,
      distance,
      movablePrev: prev
    });

    const { status } = unit;
    const { y, x } = field.coordinates(cellId);
    for (let range=status.min_range; range<=status.max_range; range++) {
      const bd = 90 / range;
      for(let i=0; i<360; i+=bd) {
        const ay = y + (range * Math.sin(i * (Math.PI / 180)) | 0);
        const ax = x + (range * Math.cos(i * (Math.PI / 180)) | 0);
        const acid = field.cellId(ay, ax);
        if (field.isActiveCell(ay, ax)) {
          this.setActionable(acid, cellId);
        }
      }
    }
  }

  getMovables() {
    return Array.from(this.map.keys()).filter(cellId => {
      const info = this.info(cellId);
      return info.isMovable;
    });
  }

  setActionable(cellId, from) {
    const info = this.info(cellId);
    this.map.set(cellId, {
      ...info,
      isActionable: true,
      actionableFrom: info.actionableFrom.concat(from),
    });
  }

  getActionables() {
    return Array.from(this.map.keys()).filter(cellId => {
      const info = this.info(cellId);
      return info.isActionable;
    });
  }

  getActionableFrom(cellId) {
    return this.info(cellId).actionableFrom;
  }

  getMoveRoute(toCellId) {
    let result = [toCellId];
    let current = toCellId;
    for(let l=0; l<500; l++) {
      const info = this.info(current);
      if (!info || info.movablePrev == null) {
        break;
      }
      current = info.movablePrev;
      result.push(current);
    }
    return result.reverse();
  }

  setGraph(cellSize) {
    const { game, isHealer } = this;
    const movables = this.getMovables();
    const actionables = this.getActionables();
    if (actionables) {
      actionables.filter(cid => !movables || !movables.includes(cid)).map(cid => {
        const { y, x } = game.field.coordinates(cid);
        const color = isHealer ? 0x87ceeb : 0xffd700;
        const highlight = new PIXI.Graphics();
        highlight.beginFill(color, 0.5);
        highlight.lineStyle(1, color);
        highlight.drawRect(x*cellSize, y*cellSize, cellSize, cellSize);
        this.container.addChild(highlight);
      });
    }
    if (movables) {
      movables.map(cid => {
        const { y, x } = game.field.coordinates(cid);
        const color = 0x98fb98;
        const highlight = new PIXI.Graphics();
        highlight.beginFill(color, 0.5);
        highlight.lineStyle(1, color);
        highlight.drawRect(x*cellSize, y*cellSize, cellSize, cellSize);
        this.container.addChild(highlight);
      });
    }
  }

}
