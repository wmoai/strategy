const Units = require('../../models/Units.js');
const Unit = require('../../models/Unit.js');
const Immutable = require('immutable');

beforeAll(() => {
  require('../../data').init();
});

describe('Units', () => {
  describe('toData()', () => {
    test('process unit list to pure array', () => {
      const mapMock = jest.fn();
      const toArrayMock = jest.fn();
      mapMock.mockReturnValueOnce({
        toArray: toArrayMock
      });
      toArrayMock.mockReturnValue(['expected', 'data']);

      const units = new Units({
        list: { map: mapMock },
      });

      expect(units.toData()).toEqual(['expected', 'data']);
      expect(mapMock.mock.calls.length).toBe(1);
      expect(toArrayMock.mock.calls.length).toBe(1);
    });
  });

  describe('restore()', () => {
    test('return Units instance', () => {
      const actual = Units.restore([
        { unitId: 1 },
        { unitId: 5 },
      ]);
      expect(actual).toBeInstanceOf(Units);
      expect(actual.list.get(0).unitId).toBe(1);
      expect(actual.list.get(1).unitId).toBe(5);
    });
  });

  describe('find()', () => {
    test('find unit', () => {
      const units = new Units({
        list: Immutable.List([
          new Unit({unitId: 2, cellId: 11, hp:1}),
          new Unit({unitId: 7, cellId: 15, hp:2}),
        ])
      });

      const actual = units.find(15);
      expect(actual).toBeInstanceOf(Unit);
      expect(actual.unitId).toBe(7);
    });
  });

});
