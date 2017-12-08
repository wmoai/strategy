import React from 'react';

import Lobby from '../../containers/Lobby.js';
import Selector from '../../containers/Selector.js';
import Game from '../../containers/Game.js';

export default class Match extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLocked: false
    };
  }

  componentDidMount() {
    this.popstateListener = () => {
      if (this.state.isLocked) {
        history.pushState(null, null, null);
      }
    };
    window.addEventListener('popstate', this.popstateListener);
    this.unloadListener = e => {
      if (this.state.isLocked) {
        e.returnValue = 'test';
      }
    };
    window.addEventListener('beforeunload', this.unloadListener);
  }

  componentWillUnmount() {
    if (this.state.isLocked) {
      history.back();
    }
    window.removeEventListener('popstate', this.popstateListener);
    window.removeEventListener('beforeunload', this.unloadListener);
  }

  componentWillReceiveProps(nextProps) {
    const { room } = nextProps;
    if (room && !this.state.isLocked) {
      history.pushState(null, null, null);
      this.setState({ isLocked: true });
    } else if (!room && this.state.isLocked) {
      history.back();
      this.setState({ isLocked: false });
    }
  }

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


