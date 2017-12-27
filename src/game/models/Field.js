// @flow

type FieldInfo = {
  oinit: Array<number>,
  dinit: Array<number>,
  base: Array<number>,
};
type FieldData = {
  id: number,
  width: number,
  height: number,
  terrain: Array<number>,
  info: FieldInfo,
};

export default class Field {
  id: number;
  width: number;
  height: number;
  terrain: Array<number>;
  info: FieldInfo;

  constructor({ id, width, height, terrain, info }: FieldData) {
    this.id = id;
    this.width = width;
    this.height = height;
    this.terrain = terrain;
    this.info = info;
  }

  initialPos(isOffense: boolean) {
    return isOffense ? this.info['oinit'] : this.info['dinit'];
  }

  existsCell(y: number, x: number): boolean {
    const { width, height } = this;
    return (
      y >= 0
      && y < height
      && x >= 0
      && x < width
    );
  }

  isEdgeCell(y: number, x: number): boolean {
    const { width, height } = this;
    if (!this.existsCell(y, x)) {
      return false;
    }
    return (
      x == 0
      || y == 0
      || x == width-1
      || y == height-1
    );
  }

  isActiveCell(y: number, x: number): boolean {
    return this.existsCell(y, x) && !this.isEdgeCell(y, x);
  }

  cellId(y: number, x: number): number {
    return y * this.width + x;
  }

  isSameTerrainWithNeighbor(y: number, x: number): {
    top: boolean,
    left: boolean,
    bottom: boolean,
    right: boolean,
    tl: boolean,
    tr: boolean,
    bl: boolean,
    br: boolean,
  } {
    const { terrain } = this;
    const land = terrain[this.cellId(y, x)];
    return {
      top: !this.existsCell(y-1, x) || this.isSameTerrain(land, terrain[this.cellId(y-1, x)]),
      left: !this.existsCell(y, x-1) || this.isSameTerrain(land, terrain[this.cellId(y, x-1)]),
      right: !this.existsCell(y, x+1) || this.isSameTerrain(land, terrain[this.cellId(y, x+1)]),
      bottom: !this.existsCell(y+1, x) || this.isSameTerrain(land, terrain[this.cellId(y+1, x)]),
      tl: !this.existsCell(y-1, x-1) || this.isSameTerrain(land, terrain[this.cellId(y-1, x-1)]),
      tr: !this.existsCell(y-1, x+1) || this.isSameTerrain(land, terrain[this.cellId(y-1, x+1)]),
      bl: !this.existsCell(y+1, x-1) || this.isSameTerrain(land, terrain[this.cellId(y+1, x-1)]),
      br: !this.existsCell(y+1, x+1) || this.isSameTerrain(land, terrain[this.cellId(y+1, x+1)]),
    };
  }

  isSameTerrain(base: number, other: number): boolean {
    const water = [6, 7];
    const bridge = [9, 10];
    if (water.includes(base)) {
      if (bridge.includes(other) || water.includes(other)) {
        return true;
      }
    }
    return base == other;
  }

  cellTerrainId(cellId: number): number {
    return this.terrain[cellId];
  }

  bases(): Array<number> {
    return this.info.base;
  }

  rows(): Array<any> {
    const { width, terrain } = this;
    const rows = [];
    for (var i=0; i<terrain.length; i+=width) {
      rows.push(terrain.slice(i, i+width));
    }
    return rows;
  }

  coordinates(cellId: number): {
    x: number,
    y: number,
  } {
    const { width } = this;
    return {
      y: Math.floor(cellId / width),
      x: Math.floor(cellId % width)
    };
  }

  distance(cid1: number, cid2: number): number {
    const c1 = this.coordinates(cid1);
    const c2 = this.coordinates(cid2);
    return Math.abs(c1.y - c2.y) + Math.abs(c1.x - c2.x);
  }

}

