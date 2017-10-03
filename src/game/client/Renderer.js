const PIXI = require('pixi.js');

export function preload() {
  return new Promise(resolve => {
    PIXI.loader
      .add('terrain', '/image/terrain.png')
      .add('units', '/image/units.png')
      .load(() => {
        resolve();
      });
  });
}


