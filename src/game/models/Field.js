const Immutable = require('immutable');
const Data = require('../data/');

module.exports = class Field extends Immutable.Record({
  id: null,
  width: 0,
  height: 0,
  terrain: [],
  info: {},
}) {

  static init(id) {
    //FIXME refer id
    return Data.field(2);
  }

  syncData() {
    return { id: this.id };
  }

  static restore({ id }) {
    return Field.init(id);
  }

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

  neighborSame(y, x) {
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
    if (cellId >= this.terrain.length) {
      throw new Error('cell not exists');
    }
    return Data.terrain(this.terrain[cellId]).cost.get(type);
  }

  cellTerrain(cellId) {
    return Data.terrain(this.terrain[cellId]);
  }

  avoidance(cellId) {
    if (cellId >= this.terrain.length) {
      throw new Error('cell not exists');
    }
    return Data.terrain(this.terrain[cellId]).avoidance;
  }

  rows() {
    const rows = [];
    for (var i=0; i<this.terrain.length; i+=this.width) {
      rows.push(this.terrain.slice(i, i+this.width));
    }
    return rows;
  }

  coordinates(cellId) {
    if (cellId >= this.terrain.length) {
      throw new Error('cell not exists');
    }
    return [Math.floor(cellId / this.width), Math.floor(cellId % this.width)];
  }

  distance(cid1, cid2) {
    const [y1, x1] = this.coordinates(cid1);
    const [y2, x2] = this.coordinates(cid2);
    return Math.abs(Math.abs(y1 - y2) + Math.abs(x1 - x2));
  }

};
