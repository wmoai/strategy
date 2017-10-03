const Immutable = require('immutable');

const MOVE_TYPES = [
  'foot',
  'horse',
  'hover',
  'fly',
];

module.exports = class Terrain extends Immutable.Record({
  id: null,
  name: null,
  avoidance: 0,
  cost: Immutable.Map(),
}) {

  constructor(arg) {
    super(arg);
    return this.withMutations(mnt => {
      mnt.set('avoidance', arg.avoid)
        .set('cost', mnt.cost.withMutations(mmnt => {
          MOVE_TYPES.forEach(TYPE => {
            mmnt.set(TYPE, arg[TYPE]);
          });
        }));
    });
  }

};
