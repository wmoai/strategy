const Immutable = require('immutable');

const MOVE_TYPES = [
  'foot',
  'horse',
  'hover',
  'fly',
];

const TerrainRecord = Immutable.Record({
  id: 0,
  name: '',
  avoidance: 0,
  cost: Immutable.Map(),
});

module.exports = class Terrain extends TerrainRecord {

  constructor(arg) {
    super({
      id: arg.id,
      name: arg.name,
    });
    const costs = {};
    MOVE_TYPES.forEach(TYPE => {
      costs[TYPE] = arg[TYPE];
    });
    return this.withMutations(mnt => {
      mnt.set('avoidance', arg.avoid)
        .set('cost', Immutable.Map(costs));
    });
  }

};
