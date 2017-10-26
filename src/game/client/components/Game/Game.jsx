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

  // FIXME
  // componentDidMount() {
    // window.onbeforeunload = () => {
      // return true;
    // };
  // }
  // componentWillReceiveProps(nextProps) {
    // if (nextProps.controller.game.isEnd) {
      // window.onbeforeunload = () => {
        // return null;
      // };
    // }
  // }

  render() {
    const cellSize = 50;
    const {
      me,
      game,
      ui,
      onSelectCell,
      onHoverCell,
      onEndTurn,
      onReturnRoom,
    } = this.props;
    if (!game) {
      return <div>ERR</div>;
    }

    return (
      <div id="game-container">
        <div id="game-header">
          <StatusBar
            isOffense={me.offense}
            game={game}
            ui={ui}
            onEndTurn={() => {
              onEndTurn();
            }}
          />
        </div>
        <div id="game-main">
          <Canvas
            cellSize={cellSize}
            isOffense={me.offense}
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
            onReturnRoom={()  => {
              onReturnRoom();
            }}
            isOffense={me.offense}
          />
        </div>
      </div>
    );
  }
}
