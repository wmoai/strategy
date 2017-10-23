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
            isOffense={controller.offense}
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
            isOffense={controller.offense}
          />
        </div>
      </div>
    );
  }
}
