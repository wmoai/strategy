const Immutable = require('immutable');

module.exports = class Player extends Immutable.Record({
  id: null,
  offense: null,
  deck: [], // [ unitId ]
  ready: false,
  selection: [], // [ Unit ]
}) {

  toData() {
    return {
      id: this.id,
      offense: this.offense,
      deck: this.deck,
      ready: this.ready,
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


