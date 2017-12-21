const Game = require('../../models/Game.js');
const Unit = require('../../models/Unit.js');
const Immutable = require('immutable');

beforeAll(() => {
  require('../../data').init();
});

describe('Game', () => {
  describe('toData()', () => {
    test('return object', () => {
      const game = new Game({
        cost: 1,
        fieldId: 2,
        turnCount: 3,
        turn: 4,
        isEnd: true,
        winner: false,
      });

      expect(game.toData()).toEqual({
        cost: 1,
        fieldId: 2,
        turnCount: 3,
        turn: 4,
        isEnd: true,
        winner: false,
        units: [],
      });
    });
  });

  describe('restore()', () => {
    test('return Game instance', () => {
      const actual = Game.restore({
        units: [
          { unitId: 1 },
          { unitId: 5 },
        ]
      });
      expect(actual).toBeInstanceOf(Game);
      expect(actual.units).toBeInstanceOf(Immutable.List);
      expect(actual.units.get(0).unitId).toBe(1);
      expect(actual.units.get(1).unitId).toBe(5);
    });
  });

  describe('unit()', () => {
    test('return unit', () => {
      const game = new Game({
        units: Immutable.List([
          new Unit({unitId: 2, cellId: 11, hp:1}),
          new Unit({unitId: 7, cellId: 15, hp:2}),
        ])
      });

      const actual = game.unit(15);
      expect(actual).toBeInstanceOf(Unit);
      expect(actual.unitId).toBe(7);
    });

    test('return falsy', () => {
      const game = new Game({
        units: Immutable.List([
          new Unit({unitId: 2, cellId: 11, hp:1}),
        ])
      });
      expect(game.unit(15)).toBeFalsy();
    });
  });

  describe('ownedUnits()', () => {
    test('return unit', () => {
      const game = new Game({
        units: Immutable.List([
          new Unit({unitId: 2, isOffense: true}),
          new Unit({unitId: 4, isOffense: true}),
          new Unit({unitId: 7, isOffense: false}),
        ])
      });

      const actual = game.ownedUnits(true);
      expect(actual.count()).toBe(2);
      expect(actual.get(0).unitId).toBe(2);
      expect(actual.get(1).unitId).toBe(4);
    });
  });


});
