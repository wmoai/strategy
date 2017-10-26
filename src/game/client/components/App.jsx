import React from 'react';

import Lobby from '../containers/Lobby.js';
import Selector from '../containers/Selector.js';
import Game from '../containers/Game.js';

export default class App extends React.Component {

  render() {
    const { room } = this.props;
    if (room) {
      if (room.stateIs('SELECT')) {
        return <Selector costLimit={16} />;
      } else if (room.stateIs('BATTLE')) {
        return <Game />;
      }
    }
    return <Lobby />;
  }
}


