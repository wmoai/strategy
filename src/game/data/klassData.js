// @flow
import json from './json/klass.json';

export type KlassData = {
  name: string,
  id: number,
  magical: number,
  healer: number,
  move: string,
};

let klass: Map<number, KlassData> = new Map();

Object.keys(json).forEach(klassId => {
  const data = json[klassId];
  klass.set(data.id, data);
});

export default klass;
