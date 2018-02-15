// @flow
import json from './json/unit.json';

export type UnitData = {
  name: string,
  id: number,
  hp: number,
  str: number,
  dff: number,
  fth: number,
  skl: number,
  move: number,
  min_range: number,
  max_range: number,
  cost: number,
  klass: number,
};

let unit: Map<number, UnitData> = new Map();

Object.keys(json).forEach(unitId => {
  const data = json[unitId];
  unit.set(data.id, data);
});


export default unit;
