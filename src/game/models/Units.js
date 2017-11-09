const Immutable = require('immutable');
const Unit = require('./Unit.js');

module.exports = class Units extends Immutable.Record({
  list: Immutable.List()
}) {

  init(unitsList) {
    return this.set('list', Immutable.List(unitsList));
  }

  toData() {
    return this.list.map(unit => unit.toJSON()).toArray();
  }

  static restore(data) {
    return (new Units).init(data.map(unit => new Unit(unit)));
  }

  find(cellId) {
    return this.list.filter(unit => unit.cellId == cellId && unit.isAlive()).first();
  }

  onSide(isOffense) {

  }

};
