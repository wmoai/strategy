import React from 'react';
import './Game.css';

import Canvas from '../../components/Canvas/Canvas.jsx';
import StatusBar from '../../components/StatusBar/StatusBar.jsx';
import Result from '../../components/Result/Result.jsx';
import StartTurn from '../../components/StartTurn/StartTurn.jsx';

export default class Game extends React.Component {

  render() {
    const cellSize = 50;
    const {
      onSelectCell,
      onHoverCell,
      onLineup,
      onEndTurn,
      controller,
    } = this.props;
    const { game, ui } = controller;
    if (!game) {
      return <div>ERR</div>;
    }

    return (
      <div id="game-container">
        <div id="game-header">
          <StatusBar
            isOffense={controller.offense}
            game={game}
            ui={ui}
            onLineup={() => {
              onLineup();
            }}
            onEndTurn={() => {
              onEndTurn();
            }}
          />
        </div>
        <div id="game-main">
          <Canvas
            cellSize={cellSize}
            game={game}
            ui={ui}
            onSelectCell={cellId => {
              onSelectCell(cellId);
            }}
            onHoverCell={cellId => {
              onHoverCell(cellId);
            }}
            isOffense={controller.offense}
          />
        </div>
        {game.stateIs('BATTLE') && game.won == undefined &&
            <StartTurn isMyTurn={game.turn == controller.offense} />
        }
        <Result won={game.won == undefined ? undefined : game.won == controller.offense} />
      </div>
    );
  }
}
