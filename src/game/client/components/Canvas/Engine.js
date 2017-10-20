const PIXI = require('pixi.js');

export default class Engine {

  constructor(canvas, width, height, cellSize) {
    this.resources = {};
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.app = new PIXI.Application({
      width: width * cellSize,
      height: height * cellSize,
      view: canvas,
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
    let dgree = 180;
    this.app.ticker.add(() => {
      dgree = (dgree + 2) % 360;
      const rad = dgree * Math.PI / 180;
      this.layer.range.alpha = 1 - (Math.cos(rad) + 1) / 10;
    });
    this.app.stage = stage;
  }

  setup() {
    return new Promise(resolve => {
      for(let klass=1; klass<8; klass++) {
        for(let color=0; color<3; color++) {
          this.app.loader.add(`unit${klass}_${color}`, `/image/units/${klass}_${color}.png`);
        }
      }
      this.app.loader
        .add('terrain', '/image/terrain.png')
        .load(() => {
          this.loadTerrainTexture(40);
          resolve();
        });
    });
  }

  loadTerrainTexture(tileSize) {
    const terrain = new Map();
    const originalTexture = this.app.loader.resources['terrain'].texture;
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
    this.resources.terrain = terrain;
  }

  cursorRenderer() {
    const layer = this.layer.ui;

    const { cellSize } = this;
    const left = 0
      , top = 0
      , right = cellSize
      , bottom = cellSize;
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

    return {
      render: (x, y) => {
        cursor.visible = true;
        cursor.x = x * cellSize;
        cursor.y = y * cellSize;
      }
    };
  }

  renderTerrain(field) {
    const layer = this.layer.terrain;
    layer.removeChildren();
    const { cellSize } = this;

    const terrains = new PIXI.Graphics();
    field.rows().forEach((row, y) => {
      row.forEach((terrain, x) => {
        const same = field.neighborSame(y, x);
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
    field.info.base.map(bp => {
      const y = Math.floor(bp / field.width);
      const x = bp % field.width;

      const base = new PIXI.Graphics();
      const width = 6;
      base.lineStyle(width, 0x0000ff, 0.5);
      base.drawRect(x*cellSize+width/2+1, y*cellSize+width/2+1, cellSize-width-2, cellSize-width-2);
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

    const sprite = new PIXI.Sprite(this.resources.terrain.get(terrain)[formI][cornerI]);
    sprite.x = x * cellSize + (left ? 0 : cellSize/2);
    sprite.y = y * cellSize + (top ? 0 : cellSize/2);
    sprite.width = cellSize/2;
    sprite.height = cellSize/2;
    return sprite;
  }

  renderInitialPos(field) {
    const { cellSize } = this;
    const layer = this.layer.range;
    layer.removeChildren();

    field.initialPos(true).forEach(cellId => {
      const y = Math.floor(cellId / field.width);
      const x = cellId % field.width;

      const rect = new PIXI.Graphics();
      const width = 4;
      rect.beginFill(0x0000ff, 0.5);
      rect.drawRect(x*cellSize+width/2, y*cellSize+width/2, cellSize-width, cellSize-width);
      layer.addChild(rect);
    });
  }

  lineupUIRenderer() {
    const rangeLayer = this.layer.range;
    const uiLayer = this.layer.ui;
    const { cellSize } = this;
    const margin = cellSize / 10;

    const marker = new PIXI.Graphics();
    marker.beginFill(0xffa500);
    marker.lineStyle(1, 0xf5deb3);
    marker.lineWidth = 2;
    marker.moveTo(margin, 0);
    marker.lineTo(cellSize-margin, 0);
    marker.lineTo(cellSize/2, cellSize/2);
    marker.closePath();
    marker.visible = false;
    uiLayer.addChild(marker);

    return {
      renderInitialPos: (field) => {
        const sides = [ true, false ];
        sides.forEach(side => {
          field.initialPos(side).forEach(cellId => {
            const y = Math.floor(cellId / field.width);
            const x = cellId % field.width;

            const rect = new PIXI.Graphics();
            const width = 4;
            const color = side ? 0xff0000 : 0x0000ff;
            rect.beginFill(color, 0.2);
            rect.drawRect(x*cellSize+width/2, y*cellSize+width/2, cellSize-width, cellSize-width);
            rangeLayer.addChild(rect);
          });
        });
      },
      renderPickMarker: (x, y) => {
        marker.visible = true;
        marker.x = x * cellSize;
        marker.y = y * cellSize - marker.height + 5;
      },
      removePickMarker: () => {
        marker.visible = false;
      },
      end: () => {
        rangeLayer.removeChildren();
        uiLayer.removeChild(marker);
      }
    };
  }

  unitsRenderer(field) {
    const layer = this.layer.units;

    const { cellSize } = this;
    const margin = cellSize / 10;

    return {
      render: (newUnits) => {
        layer.removeChildren();
        newUnits.forEach(unit => {
          if (!unit.isAlive()) {
            return;
          }
          const [ y, x ] = field.coordinates(unit.cellId);

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
          chara.texture = this.app.loader.resources[`unit${unit.klass().id}_${colorI}`].texture;
          container.x =  x * cellSize;
          container.y = y * cellSize;
          greenLine.width = (cellSize-4) * unit.hp / unit.status().hp;

          layer.addChild(container);
        });
      }
    };
  }

  rangeRenderer(field) {
    const layer = this.layer.range;
    const { cellSize } = this;

    return {
      render: (ui) => {
        const { movables, actionables } = ui;
        if (actionables) {
          const isHealer = ui.forcusedUnit ? ui.forcusedUnit.klass().healer : false;
          actionables.filter(cid => !movables || !movables.includes(cid)).map(cid => {
            const [ y, x ] = field.coordinates(cid);
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
            const [ y, x ] = field.coordinates(cid);
            const color = 0x98fb98;
            const highlight = new PIXI.Graphics();
            highlight.beginFill(color, 0.5);
            highlight.lineStyle(1, color);
            highlight.drawRect(x*cellSize, y*cellSize, cellSize, cellSize);
            layer.addChild(highlight);
          });
        }
      },
      remove: () => {
        layer.removeChildren();
      }
    };
  }

}
