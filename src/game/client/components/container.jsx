import React from 'react';
import { render } from 'react-dom';
import MicroContainer from 'react-micro-container';

import socketIOClient from 'socket.io-client';
const socket = socketIOClient('/game');

import Preparation from './Preparation.jsx';
import UnitSymbol from './unitSymbol.jsx';
import Result from './Result.jsx';
import Navigator from './Navigator.jsx';

const Client = require('../../Client.js');
let lockScreen = true;

class Container extends MicroContainer {
  constructor(props) {
    super(props);

    const mid = document.getElementById('mid').value;
    this.state = {
      client: new Client(mid, socket),
      prep: {
        show: false,
        selected: [],
        cost: 0
      },
      info: {},
      winner: undefined,
      naviLeft: false
    };

    socket.on('metaData', data => {
      this.setState({
        client: this.state.client.setMetaData(data)
      });
    });
    socket.on('mirror', data => {
      this.setState({
        client: this.state.client.mirror(data),
        info: {}
      });
    });
    socket.on('preparation', () => {
      const prep = this.state.prep;
      prep.show = true;
      this.setState({
        prep: prep
      });
    });
    socket.on('completeAction', data => {
      this.setState({
        client: this.state.client.mirror(data, true),
        info: {}
      });
    });
    socket.on('winner', pnum => {
      this.setState({
        winner: pnum
      });
    });

  }

  componentDidMount() {
    this.subscribe({
      selectSortie: this.selectSortie,
      makeSortie: this.handleMakeSortie,
      selectCell: (cellId) => {
        this.setState({
          game: this.state.client.selectCell(cellId)
        });
      },
      hoverCell: this.handleHoverCell,
      returnPortal: this.handleReturnPortal
    });

    window.addEventListener('mouseover', e => {
      if (window.innerWidth / 2 < e.clientX) {
        this.setState({
          naviLeft: true
        });
      } else {
        this.setState({
          naviLeft: false
        });
      }
    });
  }

  selectSortie(index, cost) {
    const prep = this.state.prep;
    const indexOf = prep.selected.indexOf(index);
    if (indexOf >= 0) {
      prep.selected.splice(indexOf, 1);
      prep.cost -= cost;
    } else {
      prep.selected.push(index);
      prep.cost += cost;
    }
    this.setState({
      prep: prep
    });
  }

  handleMakeSortie() {
    const prep = this.state.prep;
    socket.emit('prepared', prep.selected);
    prep.show = false;
    this.setState({
      prep: prep
    });
  }

  handleHoverCell(cellId) {
    this.setState({
      info: {
        unit: this.state.client.unit(cellId),
        battle: this.state.client.actionForecast(cellId)
      }
    });
  }
  handleReturnPortal() {
    location.href= window.location.origin;
  }

  render() {
    const game = this.state.client.game;
    const map = game.map;
    if (!map) {
      return (
        <div>ロード中</div>
      );
    }
    const units = game.map.units;
    const info = this.state.info;
    const movable = this.state.client.mask.movable || {};
    const actionable = this.state.client.mask.actionable || {};
    const pnum = this.state.client.pnum;

    return (
      <div>
        <Result
          dispatch={this.dispatch}
          winner={this.state.winner}
          mypnum={pnum}
        />
        <Preparation
          dispatch={this.dispatch}
          show={this.state.prep.show}
          pnum={pnum}
          deck={this.state.client.deck}
          selected={this.state.prep.selected}
          cost={this.state.prep.cost}
          />
        <table id="field">
          <tbody>
            {map.field.rows().map((row, y) => {
              return (
                <tr key={y}>
                  {row.map((geo, x) => {
                    const cellId = map.field.cellId(y, x);
                    let maskClasses = ['overlay'];
                    if (movable[cellId] != undefined) {
                      maskClasses.push('movable');
                    } else if (actionable[cellId]) {
                      if (this.state.client.forcusedUnit.klass().healer) {
                        maskClasses.push('healable');
                      } else {
                        maskClasses.push('attackable');
                      }
                    }
                    return (
                      <td
                        className={`geo_${geo}`}
                        key={x}
                        onClick={() => {this.dispatch('selectCell', cellId);}}
                        onMouseOver={() => {this.dispatch('hoverCell', cellId);}}
                      >
                        <div className={maskClasses.join(' ')}></div>
                        <UnitSymbol
                          unit={units[cellId]}
                          pnum={pnum} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <Navigator
          dispatch={this.dispatch}
          refunit={info.unit}
          refbattle={info.battle}
          pnum={pnum}
          left={this.state.naviLeft}
        />
      </div>
    );
  }
}

window.onload = function() {
  render(
    React.createElement(Container),
    document.querySelector('#contents')
  );
};

window.onbeforeunload = function() {
  if (lockScreen) {
    return true;
  }
  return null;
};
