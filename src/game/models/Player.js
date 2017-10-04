const Immutable = require('immutable');

module.exports = class Player extends Immutable.Record({
  id: null,
  offense: undefined,
  cost: 10,
  deck: null, // [ unitId ]
  selection: null,
  lineup: null,
}) {

  toData() {
    return {
      id: this.id,
      offense: this.offense,
      deck: this.deck,
    };
  }


};


