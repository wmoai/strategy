import React from 'react';

import Lobby from '../containers/Lobby.js';
import Selector from '../containers/Selector.js';
import Game from '../containers/Game.js';

export default class App extends React.Component {

  render() {
    const { step } = this.props;
    if (step.is('SELECT')) {
      return <Selector costLimit={16} />;
    } else if (step.is('GAME')) {
      return <Game />;
    } else {
      return <Lobby />;
    }
  }
}


