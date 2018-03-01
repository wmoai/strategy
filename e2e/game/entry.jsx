import React from 'react';
import { render } from 'react-dom';

import Room from '../../src/game/models/Room.js';
import Game from '../../src/game/models/Game.js';


import Component from '../../src/frontend/components/Game/index.jsx';
import Player from '../../src/game/models/Player.js';

import Renderer from '../../src/game/client/index.js';


const me = new Player({ id:1,  isOffense: false });
const opp = new Player({ id:2,  isOffense: true });

class Container extends React.Component {
  constructor(props) {
    super(props);
    const game = new Game({ fieldId: 2 });
    game.initUnits([
      { isOffense:true, unitId:21, state: {cellId:32} },
      // { isOffense:true, unitId:11, state: {cellId:264} },
      { isOffense:true, unitId:25, state: {cellId:36} },
      { isOffense:true, unitId:25, state: {cellId:37} },
      { isOffense:true, unitId:25, state: {cellId:38} },
      { isOffense:true, unitId:25, state: {cellId:39} },
      { isOffense:true, unitId:25, state: {cellId:40} },
      { isOffense:false, unitId:11, state: {cellId:255} },
    ]);
    // game.state.isEnd = true;
    // game.state.winner = false;
    this.state = {
      userId: 1,
      room: new Room({
        game,
        isSolo: true,
      }).addPlayer(me).addPlayer(opp).setState('BATTLE'),
      me: me,
      opponent: opp,
    };
  }

  render() {
    return (
      <Component
        onClickEndTurn={() => this.endTurn()}
        onReturnRoom={() => console.log('modoru')}
        game={this.state.room.game}
        ui={this.state.ui}
        isOffense={this.state.me.isOffense}
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
