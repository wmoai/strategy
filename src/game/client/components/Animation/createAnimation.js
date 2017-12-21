

export default ({ container, start, end, duration }) => {

  let x = start.x !== null && end.x !== null ? start.x : null;
  let y = start.y !== null && end.y !== null ? start.y : null;

  let elapsed = 0;

  function isEnd() {
    return elapsed >= duration;
  }

  function update(delta) {
    elapsed += delta;
    if (isEnd()) {
      if (x !== null) {
        x = end.x;
      }
      if (y !== null) {
        y = end.y;
      }
    } else {
      const r = elapsed / duration;
      if (x !== null) {
        x = start.x + (end.x - start.x) * r;
      }
      if (y !== null) {
        y = start.y + (end.y - start.y) * r;
      }
    }

    container.x = x;
    container.y = y;
  }

  function omit() {
    container.x = end.x;
    container.y = end.y;
  }

  return {
    isEnd,
    update,
    omit,
    container,
  };

};
