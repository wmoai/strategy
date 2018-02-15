import { connect } from 'react-redux';
import Component from '../components/Game/index.jsx';

import {
  selectCell,
  hoverCell,
  returnRoom,
} from '../actions';

const mapStateToProps = state => {
  const { room, me, socket } = state.match;
  return {
    isOffense: me.isOffense,
    game: room.game,
    socket,
    isSolo: room.isSolo,
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
