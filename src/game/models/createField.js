// @flow

/*::
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
type FieldCoordinates = {
  x: number,
  y: number,
};
export type Field = {
  id: number,
  width: number,
  height: number,
  terrain: Array<number>,
  info: FieldInfo,
  initialPos: boolean => Array<number>,
  existsCell: (number, number) => boolean,
  isEdgeCell: (number, number) => boolean,
  isActiveCell: (number, number) => boolean,
  cellId: (number, number) => number,
  isSameTerrainWithNeighbor: (number, number) => any,
  cellTerrainId: number => number,
  bases: void => Array<number>,
  rows: void => Array<any>,
  coordinates: number => FieldCoordinates,
  distance: (number, number) => number,
};
*/

module.exports = ({
  id,
  width,
  height,
  terrain,
  info
}/*: FieldData*/)/*: Field*/ => {

  function initialPos(isOffense/*: boolean*/) {
    return isOffense ? info['oinit'] : info['dinit'];
  }

  function existsCell(y/*: number*/, x/*: number*/) {
    return (
      y >= 0
      && y < height
      && x >= 0
      && x < width
    );
  }

  function isEdgeCell(y/*: number*/, x/*: number*/) {
    if (!existsCell(y, x)) {
      return false;
    }
    return (
      x == 0
      || y == 0
      || x == width-1
      || y == height-1
    );
  }

  function isActiveCell(y/*: number*/, x/*: number*/) {
    return existsCell(y, x) && !isEdgeCell(y, x);
  }

  function cellId(y/*: number*/, x/*: number*/) {
    return y * width + x;
  }

  function isSameTerrainWithNeighbor(y/*: number*/, x/*: number*/)/*: any*/ {
    const land = terrain[cellId(y, x)];
    return {
      top: !existsCell(y-1, x) || isSameTerrain(land, terrain[cellId(y-1, x)]),
      left: !existsCell(y, x-1) || isSameTerrain(land, terrain[cellId(y, x-1)]),
      right: !existsCell(y, x+1) || isSameTerrain(land, terrain[cellId(y, x+1)]),
      bottom: !existsCell(y+1, x) || isSameTerrain(land, terrain[cellId(y+1, x)]),
      tl: !existsCell(y-1, x-1) || isSameTerrain(land, terrain[cellId(y-1, x-1)]),
      tr: !existsCell(y-1, x+1) || isSameTerrain(land, terrain[cellId(y-1, x+1)]),
      bl: !existsCell(y+1, x-1) || isSameTerrain(land, terrain[cellId(y+1, x-1)]),
      br: !existsCell(y+1, x+1) || isSameTerrain(land, terrain[cellId(y+1, x+1)]),
    };
  }

  function isSameTerrain(base/*: number*/, other/*: number*/)/*: boolean*/ {
    const water = [6, 7];
    const bridge = [9, 10];
    if (water.includes(base)) {
      if (bridge.includes(other) || water.includes(other)) {
        return true;
      }
    }
    return base == other;
  }

  // function cost(cellId/*: number*/, type/*: string*/='foot') {
    // return resource.terrain[terrain[cellId]].cost.get(type);
  // }

  // function cellTerrain(cellId/*: number*/)/*: any*/ {
    // return resource.terrain[terrain[cellId]];
  // }

  // function avoidance(cellId/*: number*/) {
    // return resource.terrain[terrain[cellId]].avoidance;
  // }

  function cellTerrainId(cellId/*: number*/)/*: number */ {
    return terrain[cellId];
  }

  function bases() {
    return info.base;
  }

  function rows() {
    const rows = [];
    for (var i=0; i<terrain.length; i+=width) {
      rows.push(terrain.slice(i, i+width));
    }
    return rows;
  }

  function coordinates(cellId/*: number*/) {
    return {
      y: Math.floor(cellId / width),
      x: Math.floor(cellId % width)
    };
  }

  function distance(cid1/*: number*/, cid2/*: number*/) {
    const c1 = coordinates(cid1);
    const c2 = coordinates(cid2);
    return Math.abs(c1.y - c2.y) + Math.abs(c1.x - c2.x);
  }


  return {
    id,
    width,
    height,
    terrain,
    info,
    initialPos,
    existsCell,
    isEdgeCell,
    isActiveCell,
    cellId,
    isSameTerrainWithNeighbor,
    // cost,
    // cellTerrain,
    // avoidance,
    cellTerrainId,
    bases,
    rows,
    coordinates,
    distance
  };
};

