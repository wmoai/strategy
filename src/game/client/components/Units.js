// @flow
import Unit from '../../models/Unit.js';
import Field from '../../models/Field.js';

import PIXI from '../PIXI.js';
import Ranges from '../lib/Ranges.js';

import Component from './Component.js';
import UnitComponent from './Unit.js';
import RangesComponent from './Ranges.js';
import MoveUnit from '../animations/MoveUnit.js';
import ChangeHp from '../animations/ChangeHp.js';


export default class UnitsComponent extends Component {
  field: Field;
  cellSize: number;
  unitsMap: Map<number, UnitComponent>;
  layer: {
    ranges: any,
    units: any,
  };
  currentUnitModels: ?Array<Unit>;
  currentRanges: ?Ranges;


  constructor({ unitModels, field, cellSize }: {
    unitModels: Array<Unit>,
    field: Field,
    cellSize: number,
  }) {
    super();
    this.field = field;
    this.cellSize = cellSize;
    this.unitsMap = new Map();

    const rangesLayer = new PIXI.Container();
    const unitsLayer = new PIXI.Container();
    this.container.addChild(rangesLayer);
    this.container.addChild(unitsLayer);
    unitModels.forEach(unitModel => {
      const unit = new UnitComponent(unitModel, field, cellSize);
      unitsLayer.addChild(unit.container);
      this.unitsMap.set(unitModel.seq, unit);
    });
    this.layer = {
      ranges: rangesLayer,
      units: unitsLayer,
    };
  }

  update(unitModels: Array<Unit>, ranges: ?Ranges) {
    let isUpdated = false;
    if (this.currentUnitModels !== unitModels) {
      this.currentUnitModels = unitModels;
      this.updateUnits(unitModels);
      isUpdated = true;
    }
    if (this.currentRanges !== ranges) {
      this.currentRanges = ranges;
      this.updateRanges(ranges);
      isUpdated = true;
    }
    return isUpdated;
  }

  updateUnits(unitModels: Array<Unit>) {
    unitModels.forEach(unitModel => {
      const unit = this.unitsMap.get(unitModel.seq);
      if (unit) {
        unit.update(unitModel.state);
      }
    });
  }

  updateRanges(ranges: ?Ranges) {
    const layer = this.layer.ranges;
    layer.removeChildren();
    if (ranges) {
      const component = new RangesComponent(ranges, this.cellSize);
      layer.addChild(component.container);
    }
  }

  createMoveAnimation(unitModel: Unit, route: Array<number>): ?MoveUnit {
    const { unitsMap, field, cellSize } = this;
    const unit = unitsMap.get(unitModel.seq);
    if (unit) {
      return new MoveUnit({
        container: unit.container,
        route,
        field,
        cellSize
      });
    }
  }

  createChangeHpAnimation(change: { seq: number, hp: number }): ?ChangeHp {
    const { unitsMap } = this;
    const unit = unitsMap.get(change.seq);
    if (unit) {
      return new ChangeHp({
        unit,
        width: unit.lifeWidth(change.hp),
      });
    }
  }

  unit(seq: number): ?UnitComponent {
    return this.unitsMap.get(seq);
  }

}

