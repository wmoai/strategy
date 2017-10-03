
const Immutable = require('immutable');

module.exports = class Referee extends Immutable.Record({
  maxTurn: 40,
  thrones: Immutable.List(),
}) {


};

