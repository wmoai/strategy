const props = [
  'name', 'maxhp', 'pow',  'dff',   'fth',
  'skl',    'luc',   'move', 'range', 'magical',
  'healer', 'horse'
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
