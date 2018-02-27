import React from 'react';

import './StatusBar.css';

export default class StatusBar extends React.Component {

  render() {
    const { isOffense } = this.props;

    return (
      <div id="statusbar" className={isOffense != undefined ? (isOffense ? 'offense' : 'defense') : null}>
        {this.battleList()}
      </div>
    );
  }

  battleList() {
    const { onClickEndTurn, isOffense, turn, turnRemained, terrain } = this.props;
    const isMyTurn = isOffense === turn;

    return (
      <ul>
        <li>
          <button
            id="turn-end-button"
            disabled={!isMyTurn}
            onClick={() => {
              onClickEndTurn();
            }}>
            {isMyTurn ? (
              <span>ターン<br/>終了</span>
            ) : (
              <span>相手の<br/>ターン</span>
            )}
          </button>
        </li>
        <li id="sb-remained-turn">
          {turnRemained <= 1 ? (
            <span>最終ターン</span>
          ) : (
            <span>
              残り<b>{turnRemained}</b>ターン
            </span>
          )}
        </li>
        <li id="sb-terrain">
          {terrain && [
            <div key="name" className="name">{terrain.name}</div>,
            <div key="inf" className="influence">
              <span className="avoid">回避</span>
              <span>
                {terrain.avoidance > 0 ? `+${terrain.avoidance}` : terrain.avoidance}
              </span>
            </div>
          ]}
        </li>
      </ul>
    );

  }

}
