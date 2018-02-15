// @flow

import Terrain from '../models/Terrain.js';
import Field from '../models/Field.js';

import unit from './unitData.js';
import klass from './klassData.js';
import terrainData from './json/terrain.json';
import sekiData from '../data/json/field/seki.json';
import muhiData from '../data/json/field/muhi.json';

import './unitData.js';

const terrain: Map<number, Terrain> = new Map();
Object.keys(terrainData).forEach(key => {
  const t = new Terrain(terrainData[key]);
  terrain.set(t.id, t);
});
function getTerrain(id: number): Terrain {
  const result = terrain.get(id);
  if (!result) {
    throw `terrain [${id}] is not found.`;
  }
  return result;
}

const fields: Array<Field> = [
  new Field(sekiData),
  new Field(muhiData),
];
function getField(fieldId: ?number): Field {
  if (fieldId == null) {
    return fields[Math.floor(Math.random() * fields.length)];
  }
  let result = fields[0];
  fields.forEach(field => {
    if (fieldId == field.id) {
      result = field;
    }
  });
  return result;
}

export {
  unit,
  klass,
  getTerrain,
  getField,
};
