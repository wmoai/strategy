const PIXI = require('pixi.js');

let resources = {};

export default class GraphicRenderer {

  static preload() {
    return new Promise(resolve => {
      const loader = PIXI.loaders.shared;
      for(let klass=1; klass<8; klass++) {
        for(let color=0; color<3; color++) {
          loader.add(`unit${klass}_${color}`, `/image/units/${klass}_${color}.png`);
        }
      }
      loader.add('terrain', '/image/terrain.png')
        .load(() => {
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
          resolve();
        });
    });
  }

  constructor(canvas, field, cellSize) {
    this.field = field;
    const { width, height } = field;
    this.cellSize = cellSize;
    this.app = new PIXI.Application({
      width: width * cellSize,
      height: height * cellSize,
      view: canvas,
      sharedLoader: true,
    });
    const stage = new PIXI.Container();
    this.layer = {
      terrain: new PIXI.Container(),
      range: new PIXI.Container(),
      units: new PIXI.Container(),
      ui: new PIXI.Container()
    };
    stage.addChild(this.layer.terrain);
    stage.addChild(this.layer.range);
    stage.addChild(this.layer.units);
    stage.addChild(this.layer.ui);
    this.app.stage = stage;

    this.initCursor();
  }

  initCursor() {
    const layer = this.layer.ui;

    const { cellSize } = this;
    const left = -1
      , top = 0
      , right = cellSize
      , bottom = cellSize+1;
    const width = 15;
    const size = 4;

    const cursor = new PIXI.Graphics();
    cursor.beginFill(0xffffff);
    cursor.drawRect(left, top, width, size);
    cursor.drawRect(left, top+size, size, width-size);
    cursor.drawRect(right, top, -width, size);
    cursor.drawRect(right, top+size, -size, width-size);
    cursor.drawRect(right, bottom, -width, -size);
    cursor.drawRect(right, bottom-size, -size, -width+size);
    cursor.drawRect(left, bottom, width, -size);
    cursor.drawRect(left, bottom-size, size, -width+size);
    cursor.visible = false;
    layer.addChild(cursor);
    this.cursor = cursor;
  }

  renderCursor(x, y) {
    this.cursor.visible = true;
    this.cursor.x = x * this.cellSize;
    this.cursor.y = y * this.cellSize;
  }

  renderTerrain() {
    const layer = this.layer.terrain;
    layer.removeChildren();
    const { field, cellSize } = this;

    const terrains = new PIXI.Graphics();
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
    layer.addChild(terrains);

    // outer area shadow
    const shadow = new PIXI.Graphics();
    shadow.lineStyle(cellSize*1.5, 0, 0.3);
    shadow.drawRect(0, 0, field.width*cellSize, field.height*cellSize);
    shadow.filters = [new PIXI.filters.BlurFilter()];
    shadow.cacheAsBitmap = true;
    layer.addChild(shadow);

    // bases mark
    field.bases().map(bp => {
      const y = Math.floor(bp / field.width);
      const x = bp % field.width;

      const base = new PIXI.Graphics();
      base.beginFill(0x0000ff, 0.15);
      base.lineStyle(4, 0x0000ff, 0.5);
      base.drawRect(x*cellSize+1, y*cellSize+2, cellSize-3, cellSize-4);
      layer.addChild(base);
    });
  }

  createTerrainSprite(x, y, terrain, same, top, left) {
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

    const sprite = new PIXI.Sprite(resources.terrain.get(terrain)[formI][cornerI]);
    sprite.x = x * cellSize + (left ? 0 : cellSize/2);
    sprite.y = y * cellSize + (top ? 0 : cellSize/2);
    sprite.width = cellSize/2;
    sprite.height = cellSize/2;
    return sprite;
  }

  renderUnits(units) {
    const layer = this.layer.units;
    const { cellSize } = this;
    const margin = cellSize / 10;

    layer.removeChildren();
    units.forEach(unit => {
      if (!unit.isAlive()) {
        return;
      }
      const { y, x } = this.field.coordinates(unit.cellId);

      const container = new PIXI.Container();

      const chara = new PIXI.Sprite();
      chara.width = cellSize - margin*2;
      chara.height = cellSize - margin*2;
      chara.x = margin;
      chara.y = margin;
      container.addChild(chara);
      const redLine = new PIXI.Graphics();
      redLine.beginFill(0xdc143c);
      redLine.drawRect(2, cellSize-4, cellSize-4, 2);
      container.addChild(redLine);
      const greenLine = new PIXI.Graphics();
      greenLine.beginFill(0x40e0d0);
      greenLine.drawRect(2, cellSize-4, cellSize-4, 2);
      container.addChild(greenLine);

      const colorI = unit.acted ? 0 : (unit.offense ? 1 : 2);
      chara.texture = this.app.loader.resources[`unit${unit.klass.id}_${colorI}`].texture;
      container.x =  x * cellSize;
      container.y = y * cellSize;
      greenLine.width = (cellSize-4) * unit.hp / unit.status.hp;

      layer.addChild(container);
    });
  }

  renderRange(ui) {
    const layer = this.layer.range;
    const { cellSize } = this;
    const { ranges } = ui;
    if (!ranges) {
      return;
    }
    const movables = ranges.getMovables();
    const actionables = ranges.getActionables();
    if (actionables) {
      const isHealer = ui.forcusedUnit ? ui.forcusedUnit.klass.healer : false;
      actionables.filter(cid => !movables || !movables.includes(cid)).map(cid => {
        const { y, x } = this.field.coordinates(cid);
        const color = isHealer ? 0x87ceeb : 0xffd700;
        const highlight = new PIXI.Graphics();
        highlight.beginFill(color, 0.5);
        highlight.lineStyle(1, color);
        highlight.drawRect(x*cellSize, y*cellSize, cellSize, cellSize);
        layer.addChild(highlight);
      });
    }
    if (movables) {
      movables.map(cid => {
        const { y, x } = this.field.coordinates(cid);
        const color = 0x98fb98;
        const highlight = new PIXI.Graphics();
        highlight.beginFill(color, 0.5);
        highlight.lineStyle(1, color);
        highlight.drawRect(x*cellSize, y*cellSize, cellSize, cellSize);
        layer.addChild(highlight);
      });
    }
  }

  clearRange() {
    const layer = this.layer.range;
    layer.removeChildren();
  }

}
