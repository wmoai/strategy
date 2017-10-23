const firebase = require('../services/firebase.js');
let master;

exports.init = function() {
  return new Promise(resolve => {
    const database = firebase.database();
    database.ref('/master').once('value').then(snapshot => {
      master = snapshot.val();
      resolve();
    });
  });
};

// const UnitMaster = require('./json/unit.json');
// exports.unitStatus = function(id) {
  // return UnitMaster[id];
// };
exports.unitStatus = function(id) {
  return master.unit[id];
};
exports.units = function() {
  return master.unit;
};

// const KlassMaster = require('./json/klass.json');
// exports.klass = function(id) {
  // return KlassMaster[id];
// };
exports.klass = function(id) {
  return master.klass[id];
};

// const TerrainMaster = require('./json/terrain.json');
// const Terrain = require('../models/Terrain.js');
// const terrainMap = new Map();
// Object.keys(TerrainMaster).forEach(id => {
  // const data = TerrainMaster[id];
  // terrainMap.set(String(id), new Terrain(data));
// });
// exports.terrain = function(id) {
  // return terrainMap.get(String(id));
// };
const Terrain = require('../models/Terrain.js');
const terrains = new Map();
exports.terrain = function(id) {
  let terrain = terrains.get(String(id));
  if (!terrain && master.terrain[id]) {
    terrain = new Terrain(master.terrain[id]);
    terrains.set(String(id), terrain);
  }
  return terrain;
};


const fieldMap = new Map();
const Field = require('../models/Field.js');
fieldMap.set(1, new Field(require('../data/json/field/seki.json')));
fieldMap.set(2, new Field(require('../data/json/field/muhi.json')));
exports.field = function(id) {
  return fieldMap.get(id);
};


