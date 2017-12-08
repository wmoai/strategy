
import { Record } from 'immutable';

const Attr = Record({
  isMovable: false,
  distance: Infinity,
  movablePrev: null,
  isActionable: false,
  actionableFrom: [],
});


export default class Ranges {
  constructor(game) {
    this.game = game;
    this.map = new Map();
  }

  static calculate(game, fromCellId, unit, isFull=false) {
    const ranges = new Ranges(game);
    const { field } = game;
    const { status, klass } = unit;
    ranges.setMovable(unit, fromCellId);

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
        if (aunit && unit.offense != aunit.offense) {
          return ranges.setDistance(v, newD, u);
        }
        if (ds[v] <= newD || (!isFull && newD > status.move)) {
          return;
        }
        ds[v] = newD;
        if (isFull && newD > status.move) {
          return ranges.setDistance(v, newD, u);
        }
        ranges.setMovable(unit, v, {
          distance: newD,
          prev: u
        });
      });
    }
    return ranges;
  }

  cell(cellId) {
    let cell = this.map.get(cellId);
    if (!cell) {
      cell = new Attr();
    }
    return cell;
  }

  setDistance(cellId, distance, prev) {
    const cell = this.cell(cellId);
    if (distance < cell.distance) {
      this.map.set(cellId, cell.withMutations(mnt => {
        mnt.set('distance', distance)
        .set('movablePrev', prev);
      }));
    }
  }

  getDistance(cellId) {
    return this.cell(cellId).distance;
  }

  setMovable(unit, cellId, options) {
    const { field } = this.game;
    let distance = 0,
      prev = null;
    if (options) {
      distance = options.distance;
      prev = options.prev;
    }
    const cell = this.cell(cellId);
    this.map.set(cellId, cell.withMutations(mnt => {
      mnt.set('isMovable', true)
        .set('distance', distance)
        .set('movablePrev', prev);
    }));

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
      const cell = this.cell(cellId);
      return cell.isMovable;
    });
  }

  setActionable(cellId, from) {
    const cell = this.cell(cellId);
    this.map.set(cellId, cell.set(
      'actionableFrom',
      cell.actionableFrom.concat(from)
    ));
    this.map.set(cellId, cell.withMutations(mnt => {
      mnt.set('isActionable', true)
        .set('actionableFrom', cell.actionableFrom.concat(from));
    }));
  }

  getActionables() {
    return Array.from(this.map.keys()).filter(cellId => {
      const cell = this.cell(cellId);
      return cell.isActionable;
    });
  }

  getActionableFrom(cellId) {
    return this.cell(cellId).actionableFrom;
  }

  getMoveRoute(toCellId) {
    let result = [toCellId];
    let current = toCellId;
    for(let l=0; l<500; l++) {
      const cell = this.cell(current);
      if (!cell || cell.movablePrev == null) {
        break;
      }
      current = cell.movablePrev;
      result.push(current);
    }
    return result.reverse();
  }

}
