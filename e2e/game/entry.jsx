import React from 'react';
import { render } from 'react-dom';

const createUnit = require('../../src/game/models/createUnit.js');
const Room = require('../../src/game/models/Room.js');
const createGame = require('../../src/game/models/createGame.js');


import Component from '../../src/frontend/components/Game/index.jsx';
import State from '../../src/frontend/reducers/match/State';
import Player from '../../src/game/models/Player.js';

import Renderer from '../../src/game/client/index.js';


const me = new Player({ id:1,  isOffense: true });
const opp = new Player({ id:2,  isOffense: false });

class Container extends React.Component {
  constructor(props) {
    super(props);
    const game = createGame({ fieldId: 2 });
    game.initUnits([
      createUnit({ isOffense:true, unitId:32, state: {cellId:263} }),
      createUnit({ isOffense:true, unitId:11, state: {cellId:264} }),
      createUnit({ isOffense:false, unitId:15, state: {cellId:35} }),
      createUnit({ isOffense:false, unitId:11, state: {cellId:55} }),
    ]);
    this.state = {
      state: new State({
        room: new Room({
          game,
          isSolo: true,
        }).addPlayer(me).addPlayer(opp).setState('BATTLE'),
        me: me,
        opponent: opp,
        userId: 1,
      })
    };
  }

  componentDidUpdate() {
    if (this.state.state.room.game.turn != me.isOffense) {
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
              // state: this.state.state.set('me', new Player({ isOffense: this.state.state.room.game.turn })).clearUI()
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
        isOffense={this.state.state.me.isOffense}
        isSolo={true}
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
