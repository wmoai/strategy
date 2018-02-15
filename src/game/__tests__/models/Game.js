import Game from '../../models/Game.js';
import Unit from '../../models/Unit.js';

describe('Game', () => {

  describe('new', () => {
    test('create Game instance', () => {
      const actual = new Game({
        fieldId: 2,
        state: {
          turnCount: 3,
          turn: false,
          isEnd: true,
          winner: false,
        },
        units: [
          { unitId: 1 },
          { unitId: 5 },
        ]
      });
      expect(actual).toBeInstanceOf(Game);
      expect(actual.field.id).toBe(2);
      expect(actual.state.turnCount).toBe(3);
      expect(actual.state.turn).toBeFalsy();
      expect(actual.state.isEnd).toBeTruthy();
      expect(actual.state.winner).toBeFalsy();
      expect(actual.units.length).toBe(2);
      expect(actual.units[0]).toBeInstanceOf(Unit);
      expect(actual.units[1]).toBeInstanceOf(Unit);
      const unitsIds = actual.units.map(u => u.status.id);
      expect(unitsIds).toContain(1);
      expect(unitsIds).toContain(5);
    });
  });

  describe('toData()', () => {
    test('return object', () => {
      const game = new Game({
        fieldId: 2,
        state: {
          turnCount: 3,
          turn: false,
          isEnd: true,
          winner: false,
        },
      });

      expect(game.toData()).toEqual({
        fieldId: 2,
        units: [],
        state: {
          turnCount: 3,
          turn: false,
          isEnd: true,
          winner: false,
        },
      });
    });
  });

  describe('getUnit()', () => {
    test('return unit', () => {
      const game = new Game({
        units: [
          {unitId: 2, state: {cellId:11, hp:1}},
          {unitId: 7, state: {cellId:15, hp:2}},
        ]
      });

      const actual = game.getUnit(15);
      expect(actual).toBeInstanceOf(Unit);
      expect(actual.status.id).toBe(7);
    });

    test('return falsy', () => {
      const game = new Game({
        units: [
          {unitId: 2, state: {cellId: 11, hp:1}},
        ]
      });
      expect(game.getUnit(15)).toBeFalsy();
    });
  });

  describe('ownedUnits()', () => {
    test('return unit', () => {
      const game = new Game({
        units: [
          {unitId: 2, isOffense: true},
          {unitId: 4, isOffense: true},
          {unitId: 7, isOffense: false},
        ]
      });

      const actual = game.ownedUnits(true);
      expect(actual[0]).toBeInstanceOf(Unit);
      expect(actual[1]).toBeInstanceOf(Unit);
      expect(actual.length).toBe(2);
      const actualIds = actual.map(u => u.status.id);
      expect(actualIds).toContain(2);
      expect(actualIds).toContain(4);
    });
  });


});
