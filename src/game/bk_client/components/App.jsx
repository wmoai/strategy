import React from 'react';

import Lobby from '../containers/Lobby.js';
import Selector from '../containers/Selector.js';
import Game from '../containers/Game.js';

export default class App extends React.Component {

  /*
  componentDidMount() {
    window.onbeforeunload = () => {
      return true;
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.game.isEnd) {
      window.onbeforeunload = () => {
        return null;
      };
    }
  }
  */

  render() {
    const { room } = this.props;
    if (room) {
      if (room.stateIs('SELECT')) {
        return <Selector costLimit={16} />;
      } else if (room.stateIs('BATTLE') && room.game) {
        return <Game />;
      }
    }
    return <Lobby />;
  }
}


