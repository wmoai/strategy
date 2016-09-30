import React from 'react';
import {render} from 'react-dom';
import MicroContainer from 'react-micro-container';
import Game from './game.js';
import UnitSymbol from './unitSymbol.jsx';
import * as Unit from './unit.js';

class Container extends MicroContainer {
  constructor(props) {
    super(props);
    const land = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,2,2,1,1,1,1,9,1,1,1,1,1,1,1],
      [1,1,1,1,3,3,1,9,9,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,9,1,1,1,1,1,1,1,1],
      [1,1,1,1,3,3,1,9,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    const units = [
      new Unit.Lord(3, 3, 1),
      new Unit.Priest(2, 3, 1),
      new Unit.Archer(4, 3, 1),
      new Unit.Armor(3, 4, 1),
      new Unit.Magician(4, 4, 1),
      new Unit.Knight(8, 12, 2),
      new Unit.Knight(8, 11, 2),
      new Unit.Knight(8, 10, 2),
      new Unit.Knight(8, 9, 2),
      new Unit.Knight(8, 8, 2)
    ];
    this.state = {
      game: new Game(land, units)
    };
  }
  componentDidMount() {
    this.subscribe({
      selectCell: this.handleSelectCell
    });
  }
  handleSelectCell(y, x) {
    this.setState({
      game: this.state.game.selectCell(y, x)
    });
  }

  render() {
    return (
      <div>
        {this.state.game.field.map((row, y) => {
          return (
            <div key={y}>
              {row.map((cell, x) => {
                let maskClasses = ['overlay'];
                if (this.state.game.forcus) {
                  if (cell.mask.movable) {
                    maskClasses.push('movable');
                  } else if (cell.mask.actionable) {
                    maskClasses.push('actionable');
                  }
                }
                var cellClasses = ['cell'];
                if (cell.land == 1) {
                  cellClasses.push('plains');
                } else if (cell.land == 2) {
                  cellClasses.push('forest');
                } else if (cell.land == 3) {
                  cellClasses.push('mountain');
                } else if (cell.land == 9) {
                  cellClasses.push('water');
                }
                return (
                  <div
                    className={cellClasses.join(' ')}
                    key={x}
                    onClick={() => {this.dispatch('selectCell', y, x)}}
                  >
                    <div className={maskClasses.join(' ')}></div>
                    <UnitSymbol unit={cell.unit} />
                  </div>
                  );
              })}
            </div>
            )
        })}
      </div>
    );
  }
}


window.onload = () => {
  render(
    <Container />,
    document.querySelector("#contents")
  );
}



