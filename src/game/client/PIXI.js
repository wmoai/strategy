// @flow
const PIXI = require('pixi.js');
export default PIXI;

export let resources: {
  units: Map<number, any>,
  terrain: Map<number, Array<any>>,
  fires: Array<any>,
  lights: Array<any>,
} = {
  units: new Map(),
  terrain: new Map(),
  fires: [],
  lights: [],
};
let isPreloaded = false;

export function preload(): Promise<void> {
  return new Promise(resolve => {
    if (isPreloaded) {
      return resolve();
    }

    const loader = PIXI.loaders.shared;
    loader.add('units', '/image/units.png')
      .add('terrain', '/image/terrain.png')
      .add('fire', '/image/fire.png')
      .add('light', '/image/light.png')
      .load(() => {
        splitUnits();
        splitTerrain();
        splitFire();
        splitLight();
        isPreloaded = true;
        resolve();
      });
  });
}

function splitUnits() {
  const loader = PIXI.loaders.shared;
  const tileSize = 50;
  const units = new Map();

  const baseTexture = loader.resources['units'].texture.baseTexture;
  for (let w=0; w<baseTexture.width/tileSize; w++) {
    const set = [];
    for (let h=0; h<3; h++) {
      const frame = new PIXI.Rectangle(
        tileSize*w,
        tileSize*h,
        tileSize,
        tileSize,
      );
      const texture = new PIXI.Texture(baseTexture, frame);
      set.push(texture);
    }
    units.set(w+1, set);
  }
  resources.units = units;
}

function splitTerrain() {
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

function splitFire() {
  const loader = PIXI.loaders.shared;
  const tileSize = 120;
  const fires = [];

  const baseTexture = loader.resources['fire'].texture.baseTexture;
  for (let i=0; i<6; i++) {
    const x = i * tileSize % baseTexture.width;
    const y = Math.floor(i * tileSize / baseTexture.width) * tileSize;
    fires.push(new PIXI.Texture(baseTexture, new PIXI.Rectangle(
      x,
      y,
      tileSize,
      tileSize,
    )));
  }
  resources.fires = fires;
}

function splitLight() {
  const loader = PIXI.loaders.shared;
  const tileSize = 120;
  const lights = [];

  const baseTexture = loader.resources['light'].texture.baseTexture;
  for (let i=0; i<10; i++) {
    const x = i * tileSize % baseTexture.width;
    const y = Math.floor(i * tileSize / baseTexture.width) * tileSize;
    lights.push(new PIXI.Texture(baseTexture, new PIXI.Rectangle(
      x,
      y,
      tileSize,
      tileSize,
    )));
  }
  resources.lights = lights;
}

