
import PIXI from '../PIXI.js';
const masterData = require('../../data/');

const initialCellState = {
  isMovable: false,
  distance: Infinity,
  movablePrev: null,
  isActionable: false,
  actionableFrom: [],
};


export default (game, unit) => {
  const { field } = game;
  const map = new Map();
  const isHealer = unit.klass.healer;


  function calculate(cellId, isFull=false) {
    const { status, klass } = unit;
    setMovable(cellId);

    const ds = field.terrain.map((terrain, i) => {
      return i == cellId ? 0 : Infinity;
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
        const newD = ds[u] + masterData.terrain[field.cellTerrainId(v)].cost.get(klass.move);
        const aunit = game.getUnit(v);
        if (aunit && unit.isOffense != aunit.isOffense) {
          return setDistance(v, newD, u);
        }
        if (ds[v] <= newD || (!isFull && newD > status.move)) {
          return;
        }
        ds[v] = newD;
        if (isFull && newD > status.move) {
          return setDistance(v, newD, u);
        }
        setMovable(v, {
          distance: newD,
          prev: u
        });
      });
    }
  }

  function setMovable(cellId, options) {
    let distance = 0,
      prev = null;
    if (options) {
      distance = options.distance;
      prev = options.prev;
    }
    const state = getState(cellId);
    map.set(cellId, {
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
          setActionable(acid, cellId);
        }
      }
    }
  }

  function getState(cellId) {
    let state = map.get(cellId);
    if (!state) {
      state = {...initialCellState};
    }
    return state;
  }

  function setActionable(cellId, from) {
    const state = getState(cellId);
    map.set(cellId, {
      ...state,
      isActionable: true,
      actionableFrom: state.actionableFrom.concat(from),
    });
  }

  function setDistance(cellId, distance, prev) {
    const state = getState(cellId);
    if (distance < state.distance) {
      map.set(cellId, {
        ...state,
        distance,
        movablePrev: prev
      });
    }
  }

  function getRoute(toCellId) {
    let result = [toCellId];
    let current = toCellId;
    for(let l=0; l<500; l++) {
      const state = getState(current);
      if (!state || state.movablePrev == null) {
        break;
      }
      current = state.movablePrev;
      result.push(current);
    }
    return result.reverse();
  }

  function getMovables() {
    return Array.from(map.keys()).filter(cellId => {
      const state = getState(cellId);
      return state.isMovable;
    });
  }

  function getActionables() {
    return Array.from(map.keys()).filter(cellId => {
      const state = getState(cellId);
      return state.isActionable;
    });
  }

  function isMovable(cellId) {
    return getState(cellId).isMovable;
  }

  function getActionableFrom(cellId) {
    return getState(cellId).actionableFrom;
  }

  function getDistance(cellId) {
    return getState(cellId).distance;
  }

  function getContainer(cellSize) {
    const container = new PIXI.Container();

    const actionables = getActionables();
    const movables = getMovables();

    if (actionables) {
      actionables.filter(cid => !movables || !movables.includes(cid)).map(cid => {
        const { y, x } = game.field.coordinates(cid);
        const color = isHealer ? 0x87ceeb : 0xffd700;
        const highlight = new PIXI.Graphics();
        highlight.beginFill(color, 0.5);
        highlight.lineStyle(1, color);
        highlight.drawRect(x*cellSize, y*cellSize, cellSize, cellSize);
        container.addChild(highlight);
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
        container.addChild(highlight);
      });
    }
    return container;
  }


  return {
    calculate,
    setMovable,
    getRoute,
    getContainer,

    getMovables,
    getActionables,
    getDistance,
    isMovable,
    getActionableFrom,
  };

};
