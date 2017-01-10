const props = ['avatar', 'maxhp', 'pow', 'dff', 'fth', 'skl', 'luc', 'move', 'range', 'magical', 'healer', 'horse'];
class Klass {
  constructor(arr) {
    props.forEach((prop, i) => {
      this[prop] = arr[i];
    });
  }
  data() {
    const result = [];
    props.forEach(prop => {
      result.push(this[prop]);
    });
    return result;
  }
  landCost(land) {
    if (!this.horse) {
      return land;
    }
    return Math.floor(land * 1.5);
  }
}

// 0 name
// 1 maxhp
// 2 pow
// 3 dff
// 4 faith
// 5 skill
// 6 luck
// 7 move
// 8 range
// 9 magical
// 10 healer
// 11 horse
const masterData = require('./klass.json');

exports.deckData = function() {
  return masterData;
};

exports.get = function(id) {
  const arr = masterData[id];
  if (!arr) {
    return null;
  }
  return new Klass(arr);
};
