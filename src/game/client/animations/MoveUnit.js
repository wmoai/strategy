// @flow
import Field from '../../models/Field.js';

import Move from './Move.js';
import Animation from './Animation.js';

const FPC = 5; // Frame / Cell

export default class MoveUnit extends Animation {
  container: any;
  route: Array<number>;
  field: Field;
  cellSize: number;
  movements: Array<Move>;

  constructor({ container, route, field, cellSize }: {
    container: any,
    route: Array<number>,
    field: Field,
    cellSize: number
  }) {
    super({ container, duration: Infinity });
    this.route = route;
    this.field = field;
    this.cellSize = cellSize;

    const first = route.shift();
    const firstC = field.coordinates(first);
    let cx = firstC.x * cellSize;
    let cy = firstC.y * cellSize;
    this.movements = route.map(cellId => {
      const sx = cx;
      const sy = cy;
      const nextC = field.coordinates(cellId);
      cx = nextC.x * cellSize;
      cy = nextC.y * cellSize;
      const start = {x: sx, y: sy};
      const end = { x: cx, y: cy};
      return new Move({
        container,
        duration: FPC,
        start,
        end,
      });
    });
  }

  animate(delta: number) {
    const { movements } = this;
    if (movements.length < 1) {
      this.finish();
      return;
    }
    const movement = movements[0];
    if (movement.isEnd) {
      movement.omit();
      this.movements.shift();
      return this.animate(delta);
    }
    movement.update(delta);
  }

}
