import React from 'react';
import { render } from 'react-dom';
import MicroContainer from 'react-micro-container';
import { Record } from 'immutable';

import Client from './Client.js';
import UIEntity from './UIEntity.js';
const client = new Client();
import Game from '../Game.js';
import Preparation from './components/Preparation.jsx';
import Field from './components/Field.jsx';
import Navigator from './components/Navigator.jsx';

import socketIOClient from 'socket.io-client';
const socket = socketIOClient('/game');

class Container extends MicroContainer {
  constructor(props) {
    const Preparation = Record({
      show: false,
      selected: [],
      cost: 0
    });
    super(props);
    this.state = {
      game: new Game(),
      meta: {},
      preparation: new Preparation,
      ui: new UIEntity(),
    };
  }

  componentDidMount() {
    this.subscribe({
      selectSortie: this.selectSortie,
      makeSortie: this.makeSortie,
      hoverCell: this.hoverCell,
      selectCell: this.selectCell,
    });

    const mid = document.getElementById('mid').value;
    socket.emit('join', mid);

    socket.on('metaData', data => {
      this.setState({
        meta: client.getMetaData(data)
      });
    });
    socket.on('mirror', data => {
      this.setState({
        game: Game.restore(data)
      });
    });
    socket.on('completeAction', data => {
      this.setState({
        game: Game.restore(data)
      });
      this.clearForcus();
    });

    socket.on('preparation', () => {
      this.setState({
        preparation: this.state.preparation.set('show', true)
      });
    });
  }

  selectSortie(index, cost) {
    this.setState({
      preparation: this.state.preparation.withMutations(mnt => {
        const indexOf = mnt.selected.indexOf(index);
        if (indexOf >= 0) {
          mnt
            .set('selected', mnt.selected.filter((sel, i) => {
              return i != indexOf;
            }))
            .set('cost', mnt.cost - cost);
        } else {
          mnt
            .set('selected', mnt.selected.concat(index))
            .set('cost', mnt.cost + cost);
        }
      })

    });
  }

  makeSortie() {
    const preparation = this.state.preparation;
    socket.emit('prepared', preparation.selected);
    this.setState({
      preparation: preparation.set('show', false)
    });
  }

  hoverCell(cellId) {
    const game = this.state.game;
    const ui = this.state.ui;
    this.setState({
      ui: ui.withMutations(mnt => {
        mnt.set('hoveredUnit', game.map.unit(cellId));
        if (ui.stateIs('ACT')) {
          mnt.set('battleForecast', client.forecastBattle(
            game,
            ui.forcusedUnit,
            game.map.unit(cellId),
            ui.movedCell,
            cellId
          ));
        }
      })
    });
  }

  selectCell(cellId) {
    const game = this.state.game;
    if (!game.isRun()) {
      return;
    }
    const ui = this.state.ui;

    if (ui.stateIs('FREE')) {
      this.forcusUnit(cellId);
    } else if (ui.stateIs('MOVE')) {
      this.controlMOVE(cellId);
    } else if (ui.stateIs('ACT')) {
      this.controlACT(cellId);
    }
  }

  forcusUnit(cellId) {
    this.setState({
      ui: this.state.ui.forcusUnit(this.state.game, cellId)
    });
  }

  controlMOVE(cellId) {
    const ui = this.state.ui;
    const game = this.state.game;
    const pnum = this.state.meta.pnum;
    const tunit = game.map.unit(cellId);
    if (game.phase != pnum || (ui.forcusedCell != cellId && tunit)) {
      this.forcusUnit(cellId);
    } else if (ui.forcusedUnit && ui.forcusedUnit.pnum == pnum) {
      if (game.map.isMovable(ui.forcusedCell, cellId)) {
        const nGame = game.moveUnit(ui.forcusedCell, cellId);
        this.setState({
          game: nGame,
          ui: ui.withMutations(mnt => {
            mnt.set('mask', nGame.map.movingMap(cellId, true))
              .set('movedCell', cellId)
              .setState('ACT');
          })
        });
      } else {
        this.clearForcus();
      }
    } else {
      this.clearForcus();
    }
  }

  controlACT(cellId) {
    const game = this.state.game;
    const ui = this.state.ui;
    if (ui.mask.movable[cellId] != undefined) {
      this.actUnit();
    } else if (ui.mask.actionable[cellId] != undefined) {
      if (game.map.isActionable(ui.forcusedUnit, ui.movedCell, cellId)) {
        this.actUnit(cellId);
      }
    } else {
      // cancel move
      this.setState({
        game: game.moveUnit(ui.movedCell, ui.forcusedCell)
      });
      this.clearForcus();
    }
  }

  actUnit(cellId = null) {
    const ui = this.state.ui;
    socket.emit('action', ui.forcusedCell, ui.movedCell, cellId);
    this.setState({
      ui: ui.setState('EMITED')
    });
  }

  clearForcus() {
    this.setState({
      ui: new UIEntity()
    });
  }

  render() {
    return (
      <div>
        <Preparation
          dispatch={this.dispatch}
          data={this.state.preparation}
          meta={this.state.meta}
        />
        <Field
          dispatch={this.dispatch}
          game={this.state.game}
          pnum={this.state.meta.pnum}
          ui={this.state.ui}
        />
        <Navigator
          unit={this.state.ui.hoveredUnit}
          battle={this.state.ui.battleForecast}
          pnum={this.state.meta.pnum}
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
