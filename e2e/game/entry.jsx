import React from 'react';
import { render } from 'react-dom';

const Unit = require('../../src/game/models/Unit.js');
const Room = require('../../src/game/models/Room.js');
const Game = require('../../src/game/models/Game.js');


import Component from '../../src/game/client/components/Game/Game.jsx';
import State from '../../src/game/client/State';
import Player from '../../src/game/models/Player.js';

require('../../src/game/data').init();
import Renderer from '../../src/game/client/Renderer';


const me = new Player({ id:1,  offense: true });
const opp = new Player({ id:2,  offense: false });

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      state: new State({
        room: new Room({
          game: new Game().setField(2).initUnits([
            Unit.create({ offense:true, unitId:29, cellId:53 }),
            Unit.create({ offense:true, unitId:11, cellId:333 }),
            // Unit.create({ offense:true, unitId:34, cellId:32 }),
            Unit.create({ offense:false, unitId:15, cellId:35 }),
            Unit.create({ offense:false, unitId:11, cellId:55 }),
            // Unit.create({ offense:false, unitId:15, cellId:265 }),
            // Unit.create({ offense:false, unitId:32, cellId:4 }),
            // Unit.create({ offense:false, unitId:9, cellId:1 }),
          ]),
          isSolo: true,
        }).addPlayer(me).addPlayer(opp).setState('BATTLE'),
        me: me,
        opponent: opp,
        userId: 1,
      })
    };
  }

  componentDidUpdate() {
    if (this.state.state.room.game.turn != me.offense) {
      if (this.aiLoop) {
        return;
      }
      this.aiLoop = setInterval(() => {
        this.setState({
          state: this.state.state.mightActAI()
        });
      }, 1000);
    } else if (this.aiLoop) {
      clearInterval(this.aiLoop);
      this.aiLoop = null;
    }
  }

  actAI() {

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
        // }, () => {
          // setTimeout(() => {
            // this.setState({
              // state: this.state.state.set('me', new Player({ offense: this.state.state.room.game.turn })).clearUI()
            // });
          // }, 2000);
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
          );
        })
      ).clearUI()
    });
  }

  render() {
    return (
      <Component
        onSelectCell={cellId => this.selectCell(cellId)}
        onHoverCell={cellId => this.hoverCell(cellId)}
        onClickEndTurn={() => this.endTurn()}
        onEndMyTurn={() => {}}
        onEndAnimation={() => {}}
        game={this.state.state.room.game}
        ui={this.state.state.ui}
        isOffense={this.state.state.me.offense}
      />
    );
  }
}

Renderer.preload().then(() => {
  render(
    <Container />,
    document.getElementById('root')
  );
});
