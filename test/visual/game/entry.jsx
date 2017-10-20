import React from 'react';
import { render } from 'react-dom';

import * as Data from '../../../src/game/data/';

const Unit = require('../../../src/game/models/Unit.js');
const Field = require('../../../src/game/models/Field.js');
const Game = require('../../../src/game/models/Game.js');


import Component from '../../../src/game/client/components/Game/Game.jsx';
import Controller from '../../../src/game/client/Controller.js';

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      controller: new Controller({
        game: new Game({
          field: Field.init(),
        }).initUnits([
          Unit.create({ offense:true, unitId:29, cellId:33 }),
          // Unit.create({ offense:true, unitId:34, cellId:32 }),
          Unit.create({ offense:false, unitId:15, cellId:35 }),
          // Unit.create({ offense:false, unitId:15, cellId:265 }),
          // Unit.create({ offense:false, unitId:32, cellId:4 }),
          // Unit.create({ offense:false, unitId:9, cellId:1 }),
        ]),
        offense: true,
      })
    };
  }

  selectCell(cellId) {
    this.setState({
      controller: this.state.controller.selectCell(cellId, (...args) => {
        this.setState({
          controller: this.state.controller.withMutations(mnt => {
            mnt.set(
              'game', mnt.game.actUnit(args[1], args[2])
              .mightChangeTurn().mightEndGame()
            ).clearUI();
          })
        }, () => {
          setTimeout(() => {
            this.setState({
              controller: this.state.controller.set('offense', this.state.controller.game.turn).clearUI()
            });
          }, 2000);
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
          .clearUI();
      })
    }, () => {
      setTimeout(() => {
        this.setState({
          controller: this.state.controller.set('offense', this.state.controller.game.turn).clearUI()
        });
      }, 2000);
    });
  }

  render() {
    return (
      <Component
        onSelectCell={cellId => this.selectCell(cellId)}
        onHoverCell={cellId => this.hoverCell(cellId)}
        onEndTurn={() => this.endTurn()}
        controller={this.state.controller}
      />
    );
  }
}

Data.init().then(() => {
  render(
    <Container />,
    document.getElementById('root')
  );
});
