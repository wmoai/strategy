import React from 'react';
import './Game.css';

import Canvas from '../../components/Canvas/Canvas.jsx';
import StatusBar from '../../components/StatusBar/StatusBar.jsx';
import Result from '../../components/Result/Result.jsx';
import Notifier from '../../components/Notifier/Notifier.jsx';

export default class Game extends React.Component {

  constructor(props)  {
    super(props);
    this.state = {
      init: false
    };
  }

  render() {
    const cellSize = 50;
    const {
      controller,
      onSelectCell,
      onHoverCell,
      onLineup,
      onEndTurn,
      onReturnRoom,
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
            onInit={() => {
              this.setState({
                init: true
              });
            }}
            onSelectCell={cellId => {
              onSelectCell(cellId);
            }}
            onHoverCell={cellId => {
              onHoverCell(cellId);
            }}
            isOffense={controller.offense}
          />
        </div>
        {this.state.init && !game.isEnd &&
            <Notifier game={game} controller={controller} />
        }
        <Result
          isEnd={game.isEnd}
          won={game.winner == controller.offense}
          onReturnRoom={()  => {
            onReturnRoom();
          }}
        />
      </div>
    );
  }
}
