
import { Record } from 'immutable';

const Attr = Record({
  isMovable: false,
  stamina: -1,
  isActionable: false,
  actionableFrom: [],
});


export default class Ranges {
  constructor() {
    this.map = new Map();
  }

  cell(cellId) {
    let cell = this.map.get(cellId);
    if (!cell) {
      cell = new Attr();
    }
    return cell;
  }

  canUpdateMovable(cellId, stamina) {
    return stamina > this.cell(cellId).stamina;
  }

  addMovable(cellId, stamina) {
    const cell = this.cell(cellId);
    this.map.set(cellId, cell.withMutations(mnt => {
      mnt.set('isMovable', true)
        .set('stamina', stamina);
    }));
  }

  getMovables() {
    return Array.from(this.map.keys()).filter(cellId => {
      const cell = this.cell(cellId);
      return cell.isMovable;
    });
  }

  addActionable(cellId, from) {
    const cell = this.cell(cellId);
    this.map.set(cellId, cell.set(
      'actionableFrom',
      cell.actionableFrom.concat(from)
    ));
    this.map.set(cellId, cell.withMutations(mnt => {
      mnt.set('isActionable', true)
        .set('actionableFrom', cell.actionableFrom.concat(from));
    }));
  }

  getActionables() {
    return Array.from(this.map.keys()).filter(cellId => {
      const cell = this.cell(cellId);
      return cell.isActionable;
    });
  }

  getActionableFrom(cellId) {
    return this.cell(cellId).actionableFrom;
  }

}

