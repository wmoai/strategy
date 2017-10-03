const expect = require('chai').expect;

const Unit = require('../../src/game/Unit2.js')(
  {
    1: {
      name: 'testunit1',
      id: 1,
      hp: 34,
      pow: 12,
      dff: 5,
      fth: 2,
      skl: 2,
      luc: 2,
      hit: 80,
      klass: 1
    },
    2: {
      name: 'testunit2',
      id: 2,
      hp: 34,
      pow: 12,
      dff: 5,
      fth: 2,
      skl: 2,
      luc: 2,
      hit: 80,
      klass: 1
    }
  }
);

describe('Field', () => {
  describe('constructor', () => {
    it('should parse option', () => {
    });
  });
});



