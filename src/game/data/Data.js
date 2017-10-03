
const UnitMaster = require('./json/unit.json');
exports.unitStatus = function(id) {
  return UnitMaster[id];
};

const KlassMaster = require('./json/klass.json');
exports.klass = function(id) {
  return KlassMaster[id];
};

const TerrainMaster = require('./json/terrain.json');
const Terrain = require('../models/Terrain.js');
const terrainMap = new Map();
Object.keys(TerrainMaster).forEach(id => {
  const data = TerrainMaster[id];
  terrainMap.set(String(id), new Terrain(data));
});
exports.terrain = function(id) {
  return terrainMap.get(String(id));
};

const fieldMap = new Map();
const Field = require('../models/Field.js');
fieldMap.set(1, new Field(require('../data/json/field/seki.json')));
fieldMap.set(2, new Field(require('../data/json/field/muhi.json')));
exports.field = function(id) {
  return fieldMap.get(id);
};


