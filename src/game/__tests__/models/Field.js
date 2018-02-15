import Field from '../../models/Field.js';

describe('Field', () => {

  describe('initialPos()', () => {
    test('return data', () => {
      const field = new Field({
        info: {
          oinit: [1,2,3],
          dinit: [4,5,6]
        }
      });
      expect(field.initialPos(true)).toEqual([1,2,3]);
      expect(field.initialPos(false)).toEqual([4,5,6]);
    });
  });

  describe('existsCell()', () => {
    test('return true', () => {
      const field = new Field({
        width: 5,
        height: 6
      });
      expect(field.existsCell(0, 0)).toBeTruthy();
      expect(field.existsCell(5, 0)).toBeTruthy();
      expect(field.existsCell(5, 4)).toBeTruthy();
      expect(field.existsCell(0, 4)).toBeTruthy();
    });

    test('return false', () => {
      const field = new Field({
        width: 5,
        height: 6
      });
      expect(field.existsCell(6, 0)).toBeFalsy();
      expect(field.existsCell(6, 5)).toBeFalsy();
    });
  });

  describe('isEdgeCell()', () => {
    test('return true', () => {
      const field = new Field({
        width: 5,
        height: 6
      });
      expect(field.isEdgeCell(0, 0)).toBeTruthy();
      expect(field.isEdgeCell(5, 0)).toBeTruthy();
      expect(field.isEdgeCell(5, 4)).toBeTruthy();
      expect(field.isEdgeCell(0, 4)).toBeTruthy();
    });

    test('return false', () => {
      const field = new Field({
        width: 5,
        height: 6
      });
      expect(field.isEdgeCell(1, 1)).toBeFalsy();
      expect(field.isEdgeCell(6, 0)).toBeFalsy();
    });
  });

  describe('cellId()', () => {
    test('return seaquence number for the coordinates', () => {
      const field = new Field({
        width: 5,
        height: 6
      });
      expect(field.cellId(0, 0)).toBe(0);
      expect(field.cellId(1, 0)).toBe(5);
      expect(field.cellId(5, 4)).toBe(29);
    });
  });

  describe('isSameTerrainWithNeighbor()', () => {
    test('return object', () => {
      const field = new Field({
        width: 3,
        height: 3,
        terrain: [
          1,1,1,
          0,0,0,
          1,0,1,
        ]
      });
      expect(field.isSameTerrainWithNeighbor(1, 1)).toEqual({
        tl: false,
        top: false,
        tr: false,
        left: true,
        right: true,
        bl: false,
        bottom: true,
        br: false,
      });
    });

    test('return true when neighbor cell is not exists', () => {
      const field = new Field({
        width: 3,
        height: 3,
        terrain: [
          1,1,1,
          0,0,0,
          1,0,1,
        ]
      });
      const actual = field.isSameTerrainWithNeighbor(0, 2);
      expect(actual.tl).toBeTruthy();
      expect(actual.top).toBeTruthy();
      expect(actual.tr).toBeTruthy();
      expect(actual.right).toBeTruthy();
      expect(actual.br).toBeTruthy();
    });
  });

  describe('rows()', () => {
    test('return two-dimensional array of terrains', () => {
      const field = new Field({
        width: 3,
        height: 4,
        terrain: [
          1,1,1,
          0,0,0,
          1,0,1,
          0,1,1,
        ]
      });
      expect(field.rows()).toEqual([
        [1,1,1],
        [0,0,0],
        [1,0,1],
        [0,1,1],
      ]);
    });
  });

  describe('coordinates()', () => {
    test('return coordinates', () => {
      const field = new Field({ width: 5 });
      expect(field.coordinates(6)).toEqual({ x: 1, y: 1 });
    });
  });

  describe('distance()', () => {
    test('return distance', () => {
      const field = new Field({
        width: 5,
        height: 6
      });
      expect(field.distance(0, 7)).toBe(3);
      expect(field.distance(8, 15)).toBe(5);
    });
  });

});
