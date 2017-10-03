import React from 'react';

import Lobby from '../containers/Lobby.js';
import Selector from '../containers/Selector.js';
import Game from '../containers/Game.js';

export default class App extends React.Component {

  render() {
    const { client } = this.props;
    if (client.stateIs('SELECT')) {
      return (
        <Selector costLimit={16} />
      );
    } else if (client.stateIs('GAME')) {
      return (
        <Game />
      );
    }
    return (
      <Lobby />
    );
  }
}


