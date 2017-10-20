const Immutable = require('immutable');

module.exports = class Player extends Immutable.Record({
  id: null,
  offense: undefined,
  cost: 10,
  deck: null, // [ unitId ]
  ready: false,
  selection: null,
}) {

  toData() {
    return {
      id: this.id,
      offense: this.offense,
      deck: this.deck,
    };
  }

  reset() {
    return this.withMutations(mnt => {
      mnt.delete('offense')
        .set('ready', false)
        .delete('selection');
    });
  }


};


