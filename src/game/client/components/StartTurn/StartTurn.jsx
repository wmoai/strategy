import React from 'react';

import './StartTurn.css';

export default class StartTurn extends React.Component {

  render() {
    const { isMyTurn } = this.props;
    if (!isMyTurn) {
      return null;
    }

    return (
      <div id="start-turn-box">
        <div id="start-turn-text">
          あなたのターン
        </div>
      </div>
    );

  }

}

