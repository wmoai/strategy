import React from 'react';

import './style.css';

export default class Intro extends React.Component {

  render() {
    const { isOffense, game } = this.props;
    return (
      <div id="intro-base">
        <div id="intro-box">
          <div id="intro-win">勝利条件</div>
          <div>
            {isOffense ? (
              '敵拠点制圧'
            ) : (
              `${game.turnRemained()}ターン経過`
            )}
          </div>
          <div id="intro-lose">敗北条件</div>
          <div>
            {isOffense ? (
              `${game.turnRemained()}ターン経過`
            ) : (
              '自軍拠点が制圧される'
            )}
          </div>

        </div>
      </div>
    );
  }


}
