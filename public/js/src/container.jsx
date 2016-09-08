import React from 'react';
import {render} from 'react-dom';
import MicroContainer from 'react-micro-container';


class Container extends MicroContainer {
  constructor(props) {
    super(props);
    const land = [
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,1,2,2,1,1,1,1,1,1,1],
      [1,1,1,1,3,3,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,3,3,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1]
    ];
    const units = [
      {
        y: 3,
        x: 3,
        move: 4,
        range: [1],
        symble: '公',
        player: 1
      },
      {
        y: 4,
        x: 3,
        move: 4,
        range: [2],
        symble: '弓',
        player: 1
      },

      {
        y: 8,
        x: 9,
        move: 6,
        range: [1],
        symble: '騎',
        player: 2
      },
      {
        y: 8,
        x: 8,
        move: 6,
        range: [1],
        symble: '騎',
        player: 2
      }
    ];
    const field = land.map(row => {
      return row.map(cell => {
        return {
          land: cell
        };
      });
    });
    units.forEach(unit => {
      field[unit.y][unit.x].unit = unit;
    });
    this.state = {
      field: field,
      forcus: null
    };
  }
  componentDidMount() {
    this.subscribe({
      selectCell: this.cellControl
    });
  }
  cellControl(y, x) {
    const unit = this.state.field[y][x].unit;
    if (unit) {
      this.setMovable(unit);
    } else if (this.state.field[y][x].movable) {
      this.move(y, x);
    } else {
      this.setState({
        forcus: null
      });
    }
  }
  setMovable(unit) {
    const field = this.state.field;
    const y = unit.y
      , x = unit.x;
    field.forEach(row => {
      row.forEach(cell => {
        cell.movable = -cell.land;
        cell.actionable = false;
      });
    });

    const s4 = (y, x, move, init) => {
      if (!this.existsCell(y, x)) {
        return;
      }
      const cell = field[y][x];
      if (cell.unit && cell.unit.player != unit.player) {
        return;
      }
      if (!init) {
        move -= cell.land;
      }

      if (move >= 0 && move > cell.movable) {
        cell.movable = move;
        unit.range.forEach(r => {
          const bd = 90 / r;
          for(let i=0; i<360; i+=bd) {
            const ay = y + (r * Math.sin(i * (Math.PI / 180)) | 0);
            const ax = x + (r * Math.cos(i * (Math.PI / 180)) | 0);
            if (this.existsCell(ay, ax)) {
              field[ay][ax].actionable = true;
            }
          }
        });
        s4(y-1, x, move);
        s4(y+1, x, move);
        s4(y, x-1, move);
        s4(y, x+1, move);
      }
    }

    s4(y, x, unit.move, true);
    field.forEach(row => {
      row.forEach(cell => {
        cell.movable = (cell.movable >= 0);
      });
    });
    this.setState({
      field: field,
      forcus: unit
    });
  }
  move(y, x) {
    const unit = this.state.forcus;
    const field = this.state.field;
    if (!unit || unit.player != 1 || field[y][x].unit) {
      return;
    }
    field[unit.y][unit.x].unit = null;
    unit.py = y;
    unit.px = x;
    unit.y = y;
    unit.x = x;
    field[y][x].unit = unit;
    this.setState({
      field: field,
      forcus: null
    });
  }
  existsCell(y, x) {
    return (
      y >= 0
      && y < this.state.field.length
      && x >= 0
      && x < this.state.field[y].length
    );
  }


  render() {
    return (
      <div>
        {this.state.field.map((row, y) => {
          return (
            <div key={y}>
              {row.map((cell, x) => {
                let unit = '';
                if (cell.unit) {
                  unit = <div className='unit'>{cell.unit.symble}</div>;
                }
                let overClasses = ['overlay'];
                if (this.state.forcus) {
                  if (cell.movable) {
                    overClasses.push('movable');
                  } else if (cell.actionable) {
                    overClasses.push('actionable');
                  }
                }
                return (
                  <div
                    className='cell'
                    key={x}
                    onClick={() => {this.dispatch('selectCell', y, x)}}
                  >
                    <div className={overClasses.join(' ')}></div>
                    {unit}
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



