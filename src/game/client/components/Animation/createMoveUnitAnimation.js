
import createAnimation from './createAnimation.js';

export default ({ container, route, field, cellSize }) => {

  const first = route.shift();
  const firstC = field.coordinates(first);
  let cx = firstC.x * cellSize;
  let cy = firstC.y * cellSize;
  let animations = route.map(cellId => {
    const sx = cx;
    const sy = cy;
    const nextC = field.coordinates(cellId);
    cx = nextC.x * cellSize;
    cy = nextC.y * cellSize;
    const start = {x: sx, y: sy};
    const end = { x: cx, y: cy};
    return createAnimation({
      container,
      start,
      end,
      duration: 4
    });
  });

  let processing;

  function isEnd() {
    if (processing && processing.isEnd()) {
      processing = null;
    }
    if (!processing) {
      if (animations.length == 0) {
        return true;
      }
      processing = animations.shift();
    }
    return false;
  }

  function update(delta) {
    if (isEnd()) {
      return;
    }
    processing.update(delta);
  }

  return {
    isEnd,
    update,
    container,
  };

};
