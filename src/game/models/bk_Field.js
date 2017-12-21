// @flow

const Immutable = require('immutable');
const resource = require('../data/');

module.exports = class Field extends Immutable.Record({
  id: null,
  width: 0,
  height: 0,
  terrain: [],
  info: {},
}) {
/*::
  id: ?number;
  width: number;
  height: number;
  terrain: Array<any>;
  info: any;
*/

  initialPos(isOffense/*: boolean*/) {
    return isOffense ? this.info['oinit'] : this.info['dinit'];
  }

  existsCell(y/*: number*/, x/*: number*/) {
    return (
      y >= 0
      && y < this.height
      && x >= 0
      && x < this.width
    );
  }

  isEdgeCell(y/*: number*/, x/*: number*/) {
    if (!this.existsCell(y, x)) {
      return false;
    }
    return (
      x == 0
      || y == 0
      || x == this.width-1
      || y == this.height-1
    );
  }

  isActiveCell(y/*: number*/, x/*: number*/) {
    return this.existsCell(y, x) && !this.isEdgeCell(y, x);
  }

  cellId(y/*: number*/, x/*: number*/) {
    return y * this.width + x;
  }

  isSameTerrainWithNeighbor(y/*: number*/, x/*: number*/)/*: any*/ {
    const land = this.terrain[this.cellId(y, x)];
    return {
      // top: !this.existsCell(y-1, x) || land == this.terrain[this.cellId(y-1, x)],
      // left: !this.existsCell(y, x-1) || land == this.terrain[this.cellId(y, x-1)],
      // right: !this.existsCell(y, x+1) || land == this.terrain[this.cellId(y, x+1)],
      // bottom: !this.existsCell(y+1, x) || land == this.terrain[this.cellId(y+1, x)],
      // tl: !this.existsCell(y-1, x-1) || land == this.terrain[this.cellId(y-1, x-1)],
      // tr: !this.existsCell(y-1, x+1) || land == this.terrain[this.cellId(y-1, x+1)],
      // bl: !this.existsCell(y+1, x-1) || land == this.terrain[this.cellId(y+1, x-1)],
      // br: !this.existsCell(y+1, x+1) || land == this.terrain[this.cellId(y+1, x+1)],
      top: !this.existsCell(y-1, x) || this.isSameTerrain(land, this.terrain[this.cellId(y-1, x)]),
      left: !this.existsCell(y, x-1) || this.isSameTerrain(land, this.terrain[this.cellId(y, x-1)]),
      right: !this.existsCell(y, x+1) || this.isSameTerrain(land, this.terrain[this.cellId(y, x+1)]),
      bottom: !this.existsCell(y+1, x) || this.isSameTerrain(land, this.terrain[this.cellId(y+1, x)]),
      tl: !this.existsCell(y-1, x-1) || this.isSameTerrain(land, this.terrain[this.cellId(y-1, x-1)]),
      tr: !this.existsCell(y-1, x+1) || this.isSameTerrain(land, this.terrain[this.cellId(y-1, x+1)]),
      bl: !this.existsCell(y+1, x-1) || this.isSameTerrain(land, this.terrain[this.cellId(y+1, x-1)]),
      br: !this.existsCell(y+1, x+1) || this.isSameTerrain(land, this.terrain[this.cellId(y+1, x+1)]),
    };
  }

  isSameTerrain(base/*: number*/, other/*: number*/)/*: boolean*/ {
    const water = [6, 7];
    const bridge = [9, 10];
    if (water.includes(base)) {
      if (bridge.includes(other) || water.includes(other)) {
        return true;
      }
    }
    return base == other;
  }

  cost(cellId/*: number*/, type/*: string*/='foot') {
    return resource.terrain[this.terrain[cellId]].cost.get(type);
  }

  cellTerrain(cellId/*: number*/) {
    return resource.terrain[this.terrain[cellId]];
  }

  avoidance(cellId/*: number*/) {
    return resource.terrain[this.terrain[cellId]].avoidance;
  }

  bases() {
    return this.info.base;
  }

  rows() {
    const rows = [];
    for (var i=0; i<this.terrain.length; i+=this.width) {
      rows.push(this.terrain.slice(i, i+this.width));
    }
    return rows;
  }

  coordinates(cellId/*: number*/) {
    return {
      y: Math.floor(cellId / this.width),
      x: Math.floor(cellId % this.width)
    };
  }

  distance(cid1/*: number*/, cid2/*: number*/) {
    const c1 = this.coordinates(cid1);
    const c2 = this.coordinates(cid2);
    return Math.abs(c1.y - c2.y) + Math.abs(c1.x - c2.x);
  }

};
