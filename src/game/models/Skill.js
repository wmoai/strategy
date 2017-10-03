
const Immutable = require('immutable');

const Data_skill = {
  1: 'ambush',
  2: 'mystery',
};

module.exports = class Skill extends Immutable.Record({
  id: -1,
}) {

  is(name) {
    return Data_skill[name] == this.id;
  }

  
};
