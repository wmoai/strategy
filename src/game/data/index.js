const unit = require('./json/unit.json');
const klass = require('./json/klass.json');

const createTerrain = require('../models/createTerrain.js');
const terrainData = require('./json/terrain.json');
const terrain = {};
Object.values(terrainData).forEach(data => {
  const t = createTerrain(data);
  terrain[t.id] = t;
});

const createField = require('../models/createField.js');
const fields = [
  createField(require('../data/json/field/seki.json')),
  createField(require('../data/json/field/muhi.json')),
];
function getField(fieldId=null) {
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
}

module.exports = {
  unit,
  klass,
  terrain,
  getField,
};
