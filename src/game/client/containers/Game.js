import { connect } from 'react-redux';
import Component from '../components/Game/Game.jsx';
import {
  selectCell,
  hoverCell,
  endTurn,
  returnRoom,
} from '../actions';

const mapStateToProps = state => {
  return {
    me: state.me,
    game: state.room.game,
    ui: state.ui,
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
    onEndTurn: () => {
      dispatch(endTurn());
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
