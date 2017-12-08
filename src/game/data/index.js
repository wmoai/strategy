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
const fields = [
  new Field(require('../data/json/field/seki.json')),
  new Field(require('../data/json/field/muhi.json')),
  // new Field(require('../data/json/field/perse.json')),
];
exports.getField = (fieldId=null) => {
  if (fieldId == null) {
    return fields[Math.floor(Math.random() * fields.length)];
  }
  let result;
  fields.forEach(field => {
    if (fieldId == field.id) {
      result = field;
    }
  });
  return result;
};

