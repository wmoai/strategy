const masterJson = require('./data/json/unit.json');


const props = [
  'name', 'hp', 'pow',  'dff',   'fth',
  'skl',  'luc', 'hit',  'move', 'min_range', 'max_range',
  'magical', 'healer', 'horse'
];
module.exports = class Klass {

  constructor(arr) {
    for (let i=0; i<props.length; i++) {
      this[props[i]] = arr[i];
    }
  }

  data() {
    const result = [];
    for (let i=0; i<props.length; i++) {
      result.push(this[props[i]]);
    }
    return result;
  }

  takenFoot(land) {
    if (!this.horse) {
      return land;
    }
    return Math.floor(land * 1.5);
  }
};
