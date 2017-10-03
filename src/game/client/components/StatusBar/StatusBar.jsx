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
    const { game, isOffense } = this.props;

    return (
      <div id="statusbar" className={isOffense != undefined ? (isOffense ? 'offense' : 'defense') : null}>
        {
          game.stateIs('BEFORE') ? this.lineupList()
            : game.stateIs('BATTLE') ? this.battleList()
            : null
        }
      </div>
    );
  }

  lineupList() {
    const { dispatch, game } = this.props;
    return (
      <ul>
        {this.state.lineupSubmitted ? (
          <li className="center">
            <span>相手の布陣を待っています</span>
          </li>
        ) : (
          <li className="center">
            <button onClick={
              () => {
                this.setState({ lineupSubmitted: true }, () => {
                  dispatch('lineupArmy', game.linedupData());
                });
              }}>
              出撃準備完了
            </button>
          </li>
        )}
      </ul>
    );
  }

  battleList() {
    const { dispatch, isOffense, game, ui } = this.props;
    const { turn, field } = game;
    const remainingTurn = game.remainingTurn();
    const terrain = field.cellTerrain(ui.hoveredCell);

    let turnControl;
    if (isOffense == undefined || isOffense == turn) {
      turnControl = (
        <button onClick={
          () => {
            dispatch('endTurn');
          }}>
          ターン終了
        </button>
      );
    } else {
      turnControl = (
        <span>相手のターン</span>
      );
    }

    return (
      <ul>
        <li>{turnControl}</li>
        {remainingTurn <= 1 ? (
          <li>最終ターン</li>
        ) : (
          <li>
            残り<b>{remainingTurn}</b>ターン
          </li>
        )}
        {terrain &&
            <li className="right">
              {terrain.name} 回避 {terrain.avoidance > 0 ? `+${terrain.avoidance}` : terrain.avoidance}
            </li>
        }
      </ul>
    );

  }

}
