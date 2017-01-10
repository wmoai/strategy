const chai = require('chai');
const expect = chai.expect;

const Map = require('../../src/game/Map.js');
const Field = require('../../src/game/Field.js');
const Unit = require('../../src/game/Unit.js');
const Klass = require('../../src/game/Klass.js');

const field = new Field({
  width: 3,
  height: 3,
  array: [
    1,1,1,
    1,1,1,
    1,2,3,
  ],
  initPos: {
    1:[0,1],
    2:[7,8]
  }
});

function dummyKlass(move, ranges) {
  return new Klass([
    'test',2,3,4,5,6,7,
    move,
    ranges,false,false,false
  ]);
}

describe('Map', () => {
  describe('movingMap', () => {
    it('マッピングされること', () => {
      const map = new Map();
      map.setField(field);
      map.putUnit(4, new Unit({
        pnum: 1,
        klass: dummyKlass(2, [1])
      }));
      expect(map.movingMap(4)).to.deep.equal({
        movable: {
          0: 0,
          1: 1,
          2: 0,
          3: 1,
          4: 2,
          5: 1,
          6: 0,
          7: 0,
        },
        actionable: {
          0: true,
          1: true,
          2: true,
          3: true,
          4: true,
          5: true,
          6: true,
          7: true,
          8: true,
        }
      });
    });

    context('敵が塞いでいるとき', () => {
      it('マッピングされること', () => {
        const map = new Map();
        map.setField(field);
        map.putUnit(4, new Unit({
          pnum: 1,
          klass: dummyKlass(2, [1])
        }));
        map.putUnit(3, new Unit({
          pnum: 2,
          klass: dummyKlass(1, [1])
        }));
        expect(map.movingMap(4)).to.deep.equal({
          movable: {
            0: 0,
            1: 1,
            2: 0,
            4: 2,
            5: 1,
            7: 0,
          },
          actionable: {
            0: true,
            1: true,
            2: true,
            3: true,
            4: true,
            5: true,
            6: true,
            7: true,
            8: true,
          }
        });
      });
    });

    context('味方とすれ違うとき', () => {
      it('マッピングされること', () => {
        const map = new Map();
        map.setField(field);
        map.putUnit(4, new Unit({
          pnum: 1,
          klass: dummyKlass(2, [1])
        }));
        map.putUnit(3, new Unit({
          pnum: 1,
          klass: dummyKlass(1, [1])
        }));
        expect(map.movingMap(4)).to.deep.equal({
          movable: {
            0: 0,
            1: 1,
            2: 0,
            3: 1,
            4: 2,
            5: 1,
            6: 0,
            7: 0,
          },
          actionable: {
            0: true,
            1: true,
            2: true,
            3: true,
            4: true,
            5: true,
            6: true,
            7: true,
            8: true,
          }
        });
      });
    });
  });
});
