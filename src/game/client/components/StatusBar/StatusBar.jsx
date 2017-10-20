import React from 'react';

import './StatusBar.css';

export default class StatusBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      lineupSubmitted: false,
    };
  }

  render() {
    const { isOffense } = this.props;

    return (
      <div id="statusbar" className={isOffense != undefined ? (isOffense ? 'offense' : 'defense') : null}>
        {this.battleList()}
      </div>
    );
  }

  battleList() {
    const { onEndTurn, isOffense, game, ui } = this.props;
    const { turn, field } = game;
    const remainingTurn = game.remainingTurn();
    const terrain = field.cellTerrain(ui.hoveredCell);
    const isMyTurn = isOffense === turn;

    return (
      <ul>
        <li>
          <button
            id="turn-end-button"
            disabled={!isMyTurn}
            onClick={() => {
              onEndTurn();
            }}>
            {isMyTurn ? (
              <span>ターン<br/>終了</span>
            ) : (
              <span>相手の<br/>ターン</span>
            )}
          </button>
        </li>
        <li id="sb-remained-turn">
          {remainingTurn <= 1 ? (
            <span>最終ターン</span>
          ) : (
            <span>
              残り<b>{remainingTurn}</b>ターン
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