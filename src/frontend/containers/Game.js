import { connect } from 'react-redux';
import Component from '../components/Game/index.jsx';

import {
  initGame,
  runGame,
  changeTurn,
  endGame,
  hoverGame,
  returnRoom
} from '../actions';

const mapStateToProps = state => {
  const { room, isOffense, socket, screen } = state.match;
  const {
    isIntroduction,
    turn,
    turnRemained,
    hoveredUnit,
    hoveredTerrain,
    actionForecast,
    winner
  } = state.game;
  return {
    isOffense,
    game: room.game,
    socket,
    isSolo: room.isSolo,
    isPreview: screen === 'SELECT',
    isResult: screen === 'RESULT',
    isIntroduction,
    isMyTurn: isOffense === turn,
    turnRemained,
    hoveredUnit,
    hoveredTerrain,
    actionForecast,
    winner
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onInitGame: () => {
      dispatch(initGame());
    },
    onRunGame: () => {
      dispatch(runGame());
    },
    onChangeTurn: (turn, turnRemained) => {
      dispatch(changeTurn(turn, turnRemained));
    },
    onHoverGame: (unit, terrain, forecast) => {
      dispatch(hoverGame({ unit, terrain, forecast }));
    },
    onEndGame: winner => {
      dispatch(endGame(winner));
    },
    onReturnRoom: () => {
      dispatch(returnRoom());
    }
  };
};

const Game = connect(mapStateToProps, mapDispatchToProps)(Component);

export default Game;
