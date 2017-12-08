import React from 'react';

import './style.css';

export default class Intro extends React.Component {

  render() {
    const { isOffense, game, onClick } = this.props;
    return (
      <div
        id="intro-base"
        onClick={e => onClick(e)}
      >
        <div className="intro-box win">
          <div className="head">勝利条件</div>
          <ul>
            <li>
              {isOffense ? (
                '敵拠点に到達'
              ) : (
                `${game.turnRemained()}ターン防衛`
              )}
            </li>
            <li>敵軍の全滅</li>
          </ul>
        </div>
        <div className="intro-box lose">
          <div className="head">敗北条件</div>
          <ul>
            <li>
              {isOffense ? (
                `${game.turnRemained()}ターン経過`
              ) : (
                '自軍拠点が占拠される'
              )}
            </li>
            <li>自軍の全滅</li>
          </ul>

        </div>

      </div>
    );
  }


}
