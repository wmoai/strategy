const Immutable = require('immutable');

module.exports = class Player extends Immutable.Record({
  id: null,
  isHuman: true,
  isOffense: null,
  deck: [], // [ unitId ]
  ready: false,
  selection: [], // [ Unit ]
}) {

  toData() {
    return {
      id: this.id,
      isOffense: this.isOffense,
      deck: this.deck,
      ready: this.ready,
    };
  }

  reset() {
    return this.withMutations(mnt => {
      mnt.delete('isOffense')
        .set('ready', false)
        .delete('selection');
    });
  }

};


