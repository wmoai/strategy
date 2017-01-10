const chai = require('chai');
const expect = chai.expect;

const Klass = require('../../src/game/Klass.js');

describe('Klass', () => {
  describe('constructor', () => {
    it('配列をパースすること', () => {
      const klass = new Klass(
        ['testname', 1, 3, 5, 7, 9, 2, 4, [1,2,3], true, false, true]
      );
      expect(klass.name).to.equal('testname');
      expect(klass.maxhp).to.equal(1);
      expect(klass.pow).to.equal(3);
      expect(klass.dff).to.equal(5);
      expect(klass.fth).to.equal(7);
      expect(klass.skl).to.equal(9);
      expect(klass.luc).to.equal(2);
      expect(klass.move).to.equal(4);
      expect(klass.range).to.deep.equal([1,2,3]);
      expect(klass.magical).to.be.true;
      expect(klass.healer).to.be.false;
      expect(klass.horse).to.be.true;
    });
  });
});


