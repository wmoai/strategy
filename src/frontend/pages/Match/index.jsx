import React from 'react';

import Indicator from '../../components/Indicator/index.jsx';
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
    this.unloadListener = e => {
      if (this.state.isLocked) {
        e.returnValue = 'test';
      }
    };
    window.addEventListener('beforeunload', this.unloadListener);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.unloadListener);
  }

  componentWillReceiveProps(nextProps) {
    const { room } = nextProps;
    if (room && !this.state.isLocked) {
      this.setState({ isLocked: true });
    } else if (!room && this.state.isLocked) {
      this.setState({ isLocked: false });
    }
  }

  render() {
    const { room, waiting } = this.props;
    let content = <Lobby />;
    if (room) {
      if (room.stateIs('SELECT')) {
        content = <Selector costLimit={20} />;
      } else if (room.stateIs('BATTLE') && room.game) {
        content = <Game />;
      }
    }
    // return content;
    return (
      <div>
        <Indicator shown={waiting} />
        {content}
      </div>
    );
  }

}
