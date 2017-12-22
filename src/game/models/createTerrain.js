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
export type Terrain = {
  id: number,
  name: string,
  avoidance: number,
  cost: Map<string, number>
};

const MOVE_TYPES = [
  'foot',
  'horse',
  'hover',
  'fly',
];

module.exports = ({
  id,
  name,
  avoid,
  ...moveCosts,
}: TerrainData): Terrain => {

  const cost = new Map();
  MOVE_TYPES.forEach(TYPE => {
    cost.set(TYPE, moveCosts[TYPE]);
  });
  return {
    id,
    name,
    avoidance: avoid,
    cost
  };

};
