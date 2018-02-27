// @flow

type TerrainData = {
  id: number,
  name: string,
  foot: number,
  horse: number,
  hover: number,
  fly: number,
  avoid: number,
};

const MOVE_TYPES = [
  'foot',
  'horse',
  'hover',
  'fly',
];

export default class Terrain {
  id: number;
  name: string;
  avoidance: number;
  cost: Map<string, number>;

  constructor({ id, name, avoid, ...moveCosts}: TerrainData) {
    this.id = id;
    this.name = name;
    this.avoidance = avoid;

    const cost = new Map();
    MOVE_TYPES.forEach(TYPE => {
      cost.set(TYPE, moveCosts[TYPE]);
    });
    this.cost = cost;
  }
}
