let sprite;
let cs = 40;  // cell size
const ts = 48; // sprite piece size

export function init(cellSize = 40) {
  return new Promise(resolve => {
    cs = cellSize;
    sprite = new Image();
    sprite.src = require('./images/units.png');
    sprite.onload = function() {
      resolve();
    };
  });
}

export function drawUnit(ctx, unit, x, y) {
  const sx = (unit.klass().id - 1) * ts;
  const sy = unit.acted ? 0 : (unit.offense ? ts*2 : ts);
  const m = 4;
  ctx.drawImage(sprite, sx, sy, ts, ts, x*cs+m, y*cs+m, cs-m*2, cs-m*2);
  ctx.fillStyle = 'crimson';
  ctx.fillRect(x*cs+2, (y+1)*cs-4, cs-2*2, 2);
  ctx.fillStyle = 'turquoise';
  ctx.fillRect(x*cs+2, (y+1)*cs-4, (cs-2*2)*unit.hp/unit.status().hp, 2);
}
