const chai = require('chai');
const expect = chai.expect;

const Field = require('../../src/game/Field.js').setup({
  1: { avoid: 1, foot: 2, horse: 20 },
  2: { avoid: 3, foot: 4, horse: 21 },
  3: { avoid: 5, foot: 6, horse: 22 },
  4: { avoid: 7, foot: 8, horse: 23 },
  5: { avoid: 9, foot:10, horse: 24 },
  6: { avoid:11, foot:12, horse: 25 },
  7: { avoid:13, foot:14, horse: 26 },
  8: { avoid:15, foot:16, horse: 27 }
});

const testParams = {
  width: 4,
  height: 2,
  array: [8,7,6,5,4,3,2,1],
  initPos: {
    1: [0,1],
    2: [7,8]
  }
};

describe('Field', () => {
  describe('constructor', () => {
    it('should parse option', () => {
      const field = new Field(testParams);
      expect(field.width).to.equal(4);
      expect(field.height).to.equal(2);
      expect(field.array).to.deep.equal([8,7,6,5,4,3,2,1]);
    });
  });

  describe('data', () => {
    it('should return JSONifiable object', () => {
      const field = new Field(testParams);
      expect(field.data()).to.deep.equal({
        width: 4,
        height: 2,
        array: [8,7,6,5,4,3,2,1],
        initPos: {
          1: [0,1],
          2: [7,8]
        }
      });
    });
  });

  describe('cost', () => {
    it('任意のセルのfootのコストをデフォルトで返すこと', () => {
      const field = new Field(testParams);
      expect(field.cost(0)).to.equal(16);
      expect(field.cost(5)).to.equal(6);
      expect(field.cost(7)).to.equal(2);
      expect(() => {field.cost(8);}).to.throw('cell not exists');
    });

    it('任意のセルの指定した移動タイプのコストを返すこと', () => {
      const field = new Field(testParams);
      expect(field.cost(0, 'horse')).to.equal(27);
      expect(field.cost(5, 'horse')).to.equal(22);
    });
  });

  describe('rows', () => {
    it('行に分割すること', () => {
      const field = new Field(testParams);
      expect(field.rows()).to.deep.equal([
        [8,7,6,5],
        [4,3,2,1]
      ]);
    });
  });

  describe('coordinates', () => {
    it('should return coordinates', () => {
      const field = new Field(testParams);
      expect(field.coordinates(0)).to.deep.equal([0, 0]);
      expect(field.coordinates(2)).to.deep.equal([0, 2]);
      expect(field.coordinates(7)).to.deep.equal([1, 3]);
      expect(() => {field.coordinates(8);}).to.throw('cell not exists');
    });
  });

  describe('distance', () => {
    it('should return cell distance', () => {
      const field = new Field(testParams);
      expect(field.distance(0, 1)).to.equal(1);
      expect(field.distance(3, 6)).to.equal(2);
      expect(field.distance(0, 6)).to.equal(3);
      expect(field.distance(7, 0)).to.equal(4);
      expect(() => {field.distance(0, 8);}).to.throw('cell not exists');
      expect(() => {field.distance(8, 0);}).to.throw('cell not exists');
    });
  });
});


