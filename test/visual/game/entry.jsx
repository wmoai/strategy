import React from 'react';
import { render } from 'react-dom';

const Unit = require('../../../src/game/models/Unit.js');
const Field = require('../../../src/game/models/Field.js');
const Room = require('../../../src/game/models/Room.js');
const Game = require('../../../src/game/models/Game.js');


import Component from '../../../src/game/client/components/Game/Game.jsx';
import State from '../../../src/game/client/State.js';
import Player from '../../../src/game/models/Player.js';

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      state: new State({
        room: new Room({
          game: new Game({
            field: Field.init(),
          }).initUnits([
            Unit.create({ offense:true, unitId:29, cellId:33 }),
            // Unit.create({ offense:true, unitId:34, cellId:32 }),
            Unit.create({ offense:false, unitId:15, cellId:35 }),
            // Unit.create({ offense:false, unitId:15, cellId:265 }),
            // Unit.create({ offense:false, unitId:32, cellId:4 }),
            // Unit.create({ offense:false, unitId:9, cellId:1 }),
          ])
        }),
        me: new Player({ offense: true })
      })
    };
  }

  selectCell(cellId) {
    const { state } = this.state;
    this.setState({
      state: state.selectCell(cellId, (...args) => {
        this.setState({
          state: state.set(
            'room',
            state.room.withMutations(mnt => {
              mnt.set(
                'game',
                mnt.game.actUnit(args[1], args[2])
                .mightChangeTurn().mightEndGame()
              );
            })
          ).clearUI()
        }, () => {
          setTimeout(() => {
            this.setState({
              state: this.state.state.set('me', new Player({ offense: this.state.state.room.game.turn })).clearUI()
            });
          }, 2000);
        });
      })
    });
  }

  hoverCell(cellId) {
    this.setState({
      state: this.state.state.hoverCell(cellId)
    });
  }

  endTurn() {
    this.setState({
      state: this.state.state.set(
        'room',
        this.state.state.room.withMutations(mnt => {
          mnt.set(
            'game',
            mnt.game.changeTurn().mightEndGame()
          ).clearUI();
        })
      )
    }, () => {
      setTimeout(() => {
        this.setState({
          state: this.state.state.set('me', new Player({ offense: this.state.state.room.game.turn })).clearUI()
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
        game={this.state.state.room.game}
        ui={this.state.state.ui}
        me={this.state.state.me}
      />
    );
  }
}

render(
  <Container />,
  document.getElementById('root')
);
