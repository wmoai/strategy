let sprite;
let cs = 40;  // cell size
const ts = 40; // sprite piece size

export function init(cellSize = 40) {
  return new Promise(resolve => {
    cs = cellSize;
    sprite = new Image();
    sprite.src = require('./images/geo.png');
    sprite.onload = function() {
      resolve();
    };
  });
}

export function drawTile(ctx, id, same={}, x, y, isEdge=false) {
  if (id == 1) {
    ctx.drawImage(sprite, 0, 0, ts, ts, x*cs, y*cs, cs, cs);
  } else {
    drawCorner(ctx, id, true, true, same, x, y);
    drawCorner(ctx, id, true, false, same, x, y);
    drawCorner(ctx, id, false, true, same, x, y);
    drawCorner(ctx, id, false, false, same, x, y);
  }
  if (isEdge) {
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.2;
    ctx.fillRect(x*cs, y*cs, (x+1)*cs, (y+1)*cs);
    ctx.globalAlpha = 1;
  }
}

export function drawCellHighlight(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.strokeRect(x*cs, y*cs, cs, cs);
  ctx.globalAlpha = 0.5;
  ctx.fillRect(x*cs, y*cs, cs, cs);
  ctx.globalAlpha = 1;
}

function drawCorner(ctx, geo, top, left, same={}, x, y) {
  let sx = (geo - 1) * ts;
  let sy = 0;
  if (top ? same.top : same.bottom) {
    if (left ? same.left : same.right) {
      if (top ? (left ? same.tl : same.tr) : (left ? same.bl : same.br)) {
        sy = ts * 4;
      } else {
        sy = ts * 3;
      }
    } else {
      sy = ts * 1;
    }
  } else if (left ? same.left : same.right) {
    sy = ts * 2;
  }
  sx += left ? 0 : ts/2;
  sy += top ? 0 : ts/2;
  let dx = left ? 0 : cs/2;
  let dy = top ? 0 : cs/2;
  ctx.drawImage(sprite, sx, sy, ts/2, ts/2, x*cs + dx, y*cs + dy, cs/2, cs/2);
}

