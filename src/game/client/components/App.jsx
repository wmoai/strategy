import React from 'react';

import Lobby from '../containers/Lobby.js';
import Selector from '../containers/Selector.js';
import Game from '../containers/Game.js';

import Step from '../Step.js';

export default class App extends React.Component {

  render() {
    const { step } = this.props;
    switch (step) {
      case Step.get('SELECT'):
        return <Selector costLimit={16} />;
      case Step.get('GAME'):
        return <Game />;
      default:
        return <Lobby />;
    }
  }
}


