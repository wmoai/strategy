// @flow
import Game from '../../models/Game.js';
import Unit from '../../models/Unit.js';

import * as masterData from '../../data/';


type CellState = {
  isMovable: boolean,
  distance: number,
  movablePrev: ?number,
  isActionable: boolean,
  actionableFrom: Array<number>,
};

const initialCellState: CellState = {
  isMovable: false,
  distance: Infinity,
  movablePrev: null,
  isActionable: false,
  actionableFrom: [],
};


export default class Ranges {
  game: Game;
  unit: Unit;
  map: Map<number, CellState>;


  constructor(game: Game, unit: Unit) {
    this.game = game;
    this.unit = unit;
    this.map = new Map();
  }

  calculate(cellId: number, isFull: boolean=false) {
    const { game, unit } = this;
    const { field } = game;
    const { status, klass } = unit;
    this.setMovable(cellId);

    const ds = field.terrain.map((terrain, i) => {
      return i == cellId ? 0 : Infinity;
    });
    const qs = Array.from(ds.keys()); 

    for(let l=0; l<5000; l++) {
      if (qs.length == 0) {
        break;
      }
      const minQ = qs.reduce((a, b) => ds[a] < ds[b] ? a : b);
      const u = Number(minQ);
      const spliceI = qs.indexOf(minQ);
      if (u == null || (!isFull && ds[u] > status.move)) {
        break;
      }
      qs.splice(spliceI, 1)[0];
      [u-field.width, u-1, u+1, u+field.width].forEach(v => {
        const { y, x } = field.coordinates(v);
        if (!field.isActiveCell(y, x)) {
          return;
        }
        const newD = ds[u] + masterData.getTerrain(field.cellTerrainId(v)).cost.get(klass.move);
        const aunit = game.getUnit(v);
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
        this.setMovable(v, {
          distance: newD,
          prev: u
        });
      });
    }
  }

  setMovable(cellId: number, options: ?{ distance: number, prev: number}) {
    const { game, unit } = this;
    const { field } = game;
    let distance = 0,
      prev = null;
    if (options) {
      distance = options.distance;
      prev = options.prev;
    }
    const state = this.getState(cellId);
    this.map.set(cellId, {
      ...state,
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

  getState(cellId: number): CellState {
    let state = this.map.get(cellId);
    if (!state) {
      state = {...initialCellState};
    }
    return state;
  }

  setActionable(cellId: number, from: number) {
    const state = this.getState(cellId);
    this.map.set(cellId, {
      ...state,
      isActionable: true,
      actionableFrom: state.actionableFrom.concat(from),
    });
  }

  setDistance(cellId: number, distance: number, prev: number) {
    const state = this.getState(cellId);
    if (distance < state.distance) {
      this.map.set(cellId, {
        ...state,
        distance,
        movablePrev: prev
      });
    }
  }

  getRoute(toCellId: number): Array<number> {
    let result = [];
    let current = toCellId;
    for(let l=0; l<500; l++) {
      if (current == null) {
        break;
      }
      result.push(current);
      const state = this.getState(current);
      if (state.movablePrev == null) {
        break;
      }
      current = state.movablePrev;
    }
    return result.reverse();
  }

  getMovables(): Array<number> {
    return Array.from(this.map.keys()).filter(cellId => {
      const state = this.getState(cellId);
      return state.isMovable;
    });
  }

  getActionables(): Array<number> {
    return Array.from(this.map.keys()).filter(cellId => {
      const state = this.getState(cellId);
      return state.isActionable;
    });
  }

}
