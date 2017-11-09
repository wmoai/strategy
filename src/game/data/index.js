exports.init = () => {
  exports.unit = require('./json/unit.json');
  exports.klass = require('./json/klass.json');

  const Terrain = require('../models/Terrain.js');
  const terrainData = require('./json/terrain.json');
  const terrains = {};
  Object.values(terrainData).forEach(data => {
    const terrain = new Terrain(data);
    terrains[terrain.id] = terrain;
  });
  exports.terrain = terrains;

  const Field = require('../models/Field.js');
  exports.field = {
    1: new Field(require('../data/json/field/seki.json')),
    2: new Field(require('../data/json/field/muhi.json')),
  };

  return this;
};
