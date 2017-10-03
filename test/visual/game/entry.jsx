import React from 'react';
import MicroContainer from 'react-micro-container';
import { render } from 'react-dom';


const Unit = require('../../../src/game/models/Unit.js');
const Field = require('../../../src/game/models/Field.js');

const Game = require('../../../src/game/models/Game.js');

const field = Field.init();
const units = [
  Unit.create({ offense:true, unitId:29, cellId:33 }),
  Unit.create({ offense:true, unitId:34, cellId:32 }),
  Unit.create({ offense:false, unitId:15, cellId:264 }),
  Unit.create({ offense:false, unitId:15, cellId:265 }),
  // Unit.create({ offense:false, unitId:32, cellId:4 }),
  // Unit.create({ offense:false, unitId:9, cellId:1 }),
];

import Component from '../../../src/game/client/screens/Game/Game.jsx';
import Controller from '../../../src/game/client/Controller.js';

class Container extends MicroContainer {
  constructor(props) {
    super(props);
    this.state = {
      controller: new Controller({
        game: new Game({
          field: field,
        }).initUnits(units).engage(),
        offense: true,
      })
    };
  }

  componentDidMount() {
    this.subscribe({
      selectCell: this.selectCell,
      hoverCell: this.hoverCell,
      endTurn: this.endTurn,
    });
  }

  selectCell(cellId) {
    this.setState({
      controller: this.state.controller.selectCell(cellId, (...args) => {
        this.setState({
          controller: this.state.controller.withMutations(mnt => {
            mnt.set('game', mnt.game.actUnit(args[1], args[2])
              .mightChangeTurn().mightEndGame())
              .set('offense', mnt.game.turn).clearUI();
          })
        });
      })
    });
  }

  hoverCell(cellId) {
    this.setState({
      controller: this.state.controller.hoverCell(cellId)
    });
  }

  endTurn() {
    this.setState({
      controller: this.state.controller.withMutations(mnt => {
        mnt.set('game', mnt.game.changeTurn().mightEndGame())
          .set('offense', mnt.game.turn).clearUI();
      })
    });
  }

  render() {
    return (
      <Component
        dispatch={this.dispatch}
        controller={this.state.controller}
      />
    );
  }
}

render(
  <Container />,
  document.getElementById('root')
);
