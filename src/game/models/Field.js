const Immutable = require('immutable');
const resource = require('../data/');

module.exports = class Field extends Immutable.Record({
  id: null,
  width: 0,
  height: 0,
  terrain: [],
  info: {},
}) {

  initialPos(offense) {
    return offense ? this.info['oinit'] : this.info['dinit'];
  }

  existsCell(y, x) {
    return (
      y >= 0
      && y < this.height
      && x >= 0
      && x < this.width
    );
  }

  isEdgeCell(y, x) {
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

  isActiveCell(y, x) {
    return this.existsCell(y, x) && !this.isEdgeCell(y, x);
  }

  cellId(y, x) {
    return y * this.width + x;
  }

  isSameTerrainWithNeighbor(y, x) {
    const land = this.terrain[this.cellId(y, x)];
    return {
      top: !this.existsCell(y-1, x) || land == this.terrain[this.cellId(y-1, x)],
      left: !this.existsCell(y, x-1) || land == this.terrain[this.cellId(y, x-1)],
      right: !this.existsCell(y, x+1) || land == this.terrain[this.cellId(y, x+1)],
      bottom: !this.existsCell(y+1, x) || land == this.terrain[this.cellId(y+1, x)],
      tl: !this.existsCell(y-1, x-1) || land == this.terrain[this.cellId(y-1, x-1)],
      tr: !this.existsCell(y-1, x+1) || land == this.terrain[this.cellId(y-1, x+1)],
      bl: !this.existsCell(y+1, x-1) || land == this.terrain[this.cellId(y+1, x-1)],
      br: !this.existsCell(y+1, x+1) || land == this.terrain[this.cellId(y+1, x+1)],
    };
  }

  cost(cellId, type='foot') {
    return resource.terrain[this.terrain[cellId]].cost.get(type);
  }

  cellTerrain(cellId) {
    return resource.terrain[this.terrain[cellId]];
  }

  avoidance(cellId) {
    return resource.terrain[this.terrain[cellId]].avoidance;
  }

  rows() {
    const rows = [];
    for (var i=0; i<this.terrain.length; i+=this.width) {
      rows.push(this.terrain.slice(i, i+this.width));
    }
    return rows;
  }

  coordinates(cellId) {
    return {
      y: Math.floor(cellId / this.width),
      x: Math.floor(cellId % this.width)
    };
  }

  distance(cid1, cid2) {
    const c1 = this.coordinates(cid1);
    const c2 = this.coordinates(cid2);
    return Math.abs(c1.y - c2.y) + Math.abs(c1.x - c2.x);
  }

};
