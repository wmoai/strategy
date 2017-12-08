import { connect } from 'react-redux';
import Component from '../components/Game/index.jsx';

import {
  selectCell,
  hoverCell,
  endTurn,
  returnRoom,
  endMyTurn,
  endAnimation,
} from '../actions';

const mapStateToProps = state => {
  const { room, me, ui } = state.match;
  return {
    isOffense: me.offense,
    game: room.game,
    ui,
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
    onClickEndTurn: () => {
      dispatch(endTurn());
    },
    onReturnRoom: () => {
      dispatch(returnRoom());
    },
    onEndMyTurn: () => {
      dispatch(endMyTurn());
    },
    onEndAnimation: turn => {
      dispatch(endAnimation(turn));
    }
  };
};

const Game = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Game;
