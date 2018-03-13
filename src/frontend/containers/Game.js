import { connect } from 'react-redux';
import Component from '../components/Game/index.jsx';

import {
  selectCell,
  hoverCell,
  endGame,
  returnRoom,
} from '../actions';

const mapStateToProps = state => {
  const { room, me, socket, screen, winner } = state.match;
  return {
    isOffense: me.isOffense,
    game: room.game,
    socket,
    isSolo: room.isSolo,
    screen,
    winner,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSelectCell: cellId => {
      dispatch(selectCell(cellId));
    },
    onHoverCell: cellId => {
      dispatch(hoverCell(cellId));
    },
    onEndGame: winner => {
      dispatch(endGame(winner));
    },
    onReturnRoom: () => {
      dispatch(returnRoom());
    },
  };
};

const Game = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Game;
