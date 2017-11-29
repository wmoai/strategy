import React from 'react';
import './Game.css';

import Canvas from '../../components/Canvas/Canvas.jsx';
import StatusBar from '../../components/StatusBar/StatusBar.jsx';

export default class Game extends React.Component {

  constructor(props)  {
    super(props);
    this.state = {
      init: false
    };
  }

  componentDidMount() {
    window.onbeforeunload = () => {
      return true;
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.game.isEnd) {
      window.onbeforeunload = () => {
        return null;
      };
    }
  }

  render() {
    const cellSize = 40;
    const {
      isOffense,
      game,
      ui,
      onSelectCell,
      onHoverCell,
      onClickEndTurn,
      onReturnRoom,
      onEndMyTurn,
      onEndAnimation,
    } = this.props;
    if (!game) {
      return <div>ERR</div>;
    }

    return (
      <div id="game-container">
        <style>
          {'body { overflow:hidden; }'}
        </style>
        <div id="game-header">
          <StatusBar
            isOffense={isOffense}
            game={game}
            ui={ui}
            onClickEndTurn={() => {
              onClickEndTurn();
            }}
          />
        </div>
        <div id="game-main">
          <Canvas
            cellSize={cellSize}
            isOffense={isOffense}
            game={game}
            ui={ui}
            onInit={() => {
              this.setState({
                init: true
              });
            }}
            onSelectCell={onSelectCell}
            onHoverCell={onHoverCell}
            onReturnRoom={onReturnRoom}
            onEndMyTurn={onEndMyTurn}
            onEndAnimation={onEndAnimation}
            isOffense={isOffense}
          />
        </div>
      </div>
    );
  }
}
