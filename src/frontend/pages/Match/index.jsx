import React, { Fragment } from 'react';

import Indicator from '../../components/Indicator/index.jsx';
import Disconnected from '../../components/Disconnected/index.jsx';
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
        e.returnValue = 'locked';
      }
    };
    window.addEventListener('beforeunload', this.unloadListener);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.unloadListener);
  }

  componentWillReceiveProps(nextProps) {
    const { screen } = nextProps;
    if (screen != 'LOBBY' && !this.state.isLocked) {
      this.setState({ isLocked: true });
    } else if (screen == 'LOBBY' && this.state.isLocked) {
      this.setState({ isLocked: false });
    }
  }

  render() {
    const { screen, waiting, isDisconnected, onReturnRoom } = this.props;
    const isGame = screen === 'BATTLE' || screen === 'RESULT';
    return (
      <Fragment>
        {isDisconnected && <Disconnected onReturnRoom={onReturnRoom} />}
        <Indicator shown={waiting} />
        {screen === 'SELECT' ? (
          <Selector />
        ) : isGame ? (
          <Game isPreview={screen === 'SELECT'} />
        ) : (
          <Lobby />
        )}
      </Fragment>
    );
  }
}
