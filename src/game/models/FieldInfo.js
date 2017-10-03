const Immutable = require('immutable');

class Armament extends Immutable.Record({
  init: [],
  base: []
}) {

}

module.exports = class FieldInfo extends Immutable.Record({
  pnums: [],
  armaments: Immutable.Map()
}) {

  addArmament(pnum, data) {
    return this.withMutations(mnt => {
      mnt.set(
        'armaments',
        mnt.armaments.set(pnum, new Armament(data))
      );
    });
  }

  defencePnum() {

  }


};


