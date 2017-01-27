
const geo = require('./data/json/geo.json');

module.exports = class Field {
  constructor(opt) {
    if (opt !== undefined) {
      this.width = opt.width;
      this.height = opt.height;
      this.array = opt.array;
      this.initPos = opt.initPos;
    }
  }

  data() {
    return {
      width: this.width,
      height: this.height,
      array: this.array,
      initPos: this.initPos
    };
  }

  existsCell(y, x) {
    return (
      y >= 0
      && y < this.height
      && x >= 0
      && x < this.width
    );
  }

  cellId(y, x) {
    return y * this.width + x;
  }

  cost(cellId) {
    if (cellId >= this.array.length) {
      throw new Error('cell not exists');
    }
    return geo[this.array[cellId]].foot;
  }

  rows() {
    const rows = [];
    for (var i=0; i<this.array.length; i+=this.width) {
      rows.push(this.array.slice(i, i+this.width));
    }
    return rows;
  }

  coordinates(cellId) {
    if (cellId >= this.array.length) {
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


