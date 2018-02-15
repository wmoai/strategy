// @flow
import Field from '../../models/Field.js';
import Terrain from '../../models/Terrain.js';

import PIXI, { resources } from '../PIXI.js';
import Component from './Component.js';

export default class TerrainComponent extends Component {
  cellSize: number;

  constructor({ field, cellSize }: {
    field: Field,
    cellSize: number,
  }) {
    super();
    this.cellSize = cellSize;

    const terrains = new PIXI.Container();
    field.rows().forEach((row, y) => {
      row.forEach((terrain, x) => {
        const same = field.isSameTerrainWithNeighbor(y, x);
        terrains.addChild(this.createTerrainSprite(x, y, terrain, same, true, true));
        terrains.addChild(this.createTerrainSprite(x, y, terrain, same, true, false));
        terrains.addChild(this.createTerrainSprite(x, y, terrain, same, false, true));
        terrains.addChild(this.createTerrainSprite(x, y, terrain, same, false, false));
      });
    });
    terrains.cacheAsBitmap = true;
    this.container.addChild(terrains);

    // outer area shadow
    const shadow = new PIXI.Graphics();
    shadow.lineStyle(cellSize*1.5, 0, 0.3);
    shadow.drawRect(0, 0, field.width*cellSize, field.height*cellSize);
    shadow.filters = [new PIXI.filters.BlurFilter()];
    shadow.cacheAsBitmap = true;
    this.container.addChild(shadow);

    // bases mark
    field.bases().map(bp => {
      const y = Math.floor(bp / field.width);
      const x = bp % field.width;

      const base = new PIXI.Graphics();
      base.beginFill(0x0000ff, 0.15);
      base.lineStyle(4, 0x0000ff, 0.5);
      base.drawRect(x*cellSize+1, y*cellSize+2, cellSize-3, cellSize-4);
      this.container.addChild(base);
    });
  }

  createTerrainSprite(
    x: number,
    y: number,
    terrainId: number,
    same: {
      top: boolean,
      left: boolean,
      bottom: boolean,
      right: boolean,
      tl: boolean,
      tr: boolean,
      bl: boolean,
      br: boolean,
    },
    top: boolean,
    left: boolean
  ) {
    const { cellSize } = this;
    let formI = 0;
    if (top ? same.top : same.bottom) {
      if (left ? same.left : same.right) {
        if (top ? (left ? same.tl : same.tr) : (left ? same.bl : same.br)) {
          formI = 4;
        } else {
          formI = 3;
        }
      } else {
        formI = 1;
      }
    } else if (left ? same.left : same.right) {
      formI = 2;
    }
    let cornerI = (top ? 0 : 2) + (left ? 0: 1);

    const terrainTexture = resources.terrain.get(terrainId);
    if (!terrainTexture) {
      throw `terrain ${terrainId} is not found.`;
    }
    const sprite = new PIXI.Sprite(terrainTexture[formI][cornerI]);
    sprite.x = x * cellSize + (left ? 0 : cellSize/2);
    sprite.y = y * cellSize + (top ? 0 : cellSize/2);
    sprite.width = cellSize/2;
    sprite.height = cellSize/2;
    return sprite;
  }

}
