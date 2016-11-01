import React from 'react';
import {render} from 'react-dom';
import MicroContainer from 'react-micro-container';
import UnitSymbol from './unitSymbol.jsx';

import Refunit from './refunit.jsx';

import socketIOClient from 'socket.io-client';
const socket = socketIOClient();


class Container extends MicroContainer {
  constructor(props) {
    super(props);

    this.state = {
      field: null,
      mask: {},
      info: {}
    };

    socket.on('init', data => {
      this.setState({
        mw: data.mw,
        field: data.field,
        units: data.units,
        pnum: data.playerNum,
        phase: data.phase
      });
    });
    socket.on('pnum', data => {
      this.setState({
        pnum: data.playerNum,
      });
    });

    socket.on('update', data => {
      this.setState({
        units: data.units,
        mask: data.mask,
        phase: data.phase
      });
    });
  }
  componentDidMount() {
    this.subscribe({
      selectCell: this.handleSelectCell,
      hoverCell: this.handleHoverCell,
      engage: () => {
        socket.emit('engage');
      },
      leave: () => {
        socket.emit('leave');
      }
    });
  }
  handleSelectCell(y, x) {
    socket.emit('control', [y,x]);
  }
  handleHoverCell(y, x) {
    const unit = this.state.units[x+y*this.state.mw];
    let info = this.state.info;
    info.unit = unit;
    this.setState({info: info});
  }

  render() {
    const field = this.state.field;
    if (!field) {
      return null;
    }
    const units = this.state.units;
    const mask = this.state.mask;
    const info = this.state.info;
    var person = 'ゲスト';
    if (this.state.pnum > 0) {
      person = `Player${this.state.pnum}`;
    }
    return (
      <div>
        <table id="field">
          <tbody>
            {field.map((row, y) => {
              return (
                <tr key={y}>
                  {row.map((cell, x) => {
                    let maskClasses = ['overlay'];
                    switch (mask[x+y*this.state.mw]) {
                      case 1:
                        maskClasses.push('movable');
                        break;
                      case 2:
                        maskClasses.push('attackable');
                        break;
                      case 3:
                        maskClasses.push('healable');
                        break;
                    }
                    var cellClasses = [];
                    if (cell == 1) {
                      cellClasses.push('plains');
                    } else if (cell == 2) {
                      cellClasses.push('forest');
                    } else if (cell == 3) {
                      cellClasses.push('mountain');
                    } else if (cell == 9) {
                      cellClasses.push('water');
                    }
                    return (
                      <td
                        className={cellClasses.join(' ')}
                        key={x}
                        onClick={() => {this.dispatch('selectCell', y, x);}}
                        onMouseOver={() => {this.dispatch('hoverCell', y, x);}}
                        >
                        <div className={maskClasses.join(' ')}></div>
                        <UnitSymbol unit={units[x+y*this.state.mw]} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div id="statusBar">
          あなたは{person}です
          <button onClick={() => {this.dispatch('engage');}}>engage</button>
          <button onClick={() => {this.dispatch('leave');}}>leave</button>
        </div>
        <div id="statusBar">Player{this.state.phase}のターン</div>
        <Refunit unit={info.unit} />
      </div>
    );
  }
}


window.onload = () => {
  render(
    <Container />,
    document.querySelector('#contents')
  );
};
