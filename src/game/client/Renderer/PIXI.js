const PIXI = require('pixi.js');
export default PIXI;

export let resources = {};

export function preload() {
  return new Promise(resolve => {
    const loader = PIXI.loaders.shared;
    loader.add('units', '/image/units.png')
      .add('terrain', '/image/terrain.png')
      .load(() => {
        devideUnits();
        devideTerrain();
        resolve();
      });
  });
}

function devideUnits() {
  const loader = PIXI.loaders.shared;
  const tileSize = 48;
  const units = new Map();

  const originalTexture = loader.resources['units'].texture;
  for (let h=0; h<originalTexture.width/tileSize; h++) {
    const set = [];
    for (let v=0; v<3; v++) {
      const texture = new PIXI.Texture(originalTexture);
      texture.frame = new PIXI.Rectangle(
        tileSize*h,
        tileSize*v,
        tileSize,
        tileSize
      );
      set.push(texture);
    }
    units.set(h+1, set);
  }
  resources.units = units;
}

function devideTerrain() {
  const loader = PIXI.loaders.shared;
  const tileSize = 40;
  const terrain = new Map();
  const originalTexture = loader.resources['terrain'].texture;
  for (let i=0; i<originalTexture.width/tileSize; i++) {
    const set = [];
    for (let j=0; j<5; j++) {
      const cell = [];
      for (let t=0; t<2; t++) {
        for (let l=0; l<2; l++) {
          const texture = new PIXI.Texture(originalTexture);
          texture.frame = new PIXI.Rectangle(
            tileSize*i + tileSize/2*l,
            tileSize*j + tileSize/2*t,
            tileSize/2,
            tileSize/2
          );
          cell.push(texture);
        }
      }
      set.push(cell);
    }
    terrain.set(i+1, set);
  }
  resources.terrain = terrain;
}

