import { connect } from 'react-redux';
import Component from '../components/Game/Game.jsx';
import {
  selectCell,
  hoverCell,
  endTurn,
  returnRoom,
  endMyTurn,
} from '../actions';

const mapStateToProps = state => {
  return {
    isOffense: state.me.offense,
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
    onClickEndTurn: () => {
      dispatch(endTurn());
    },
    onReturnRoom: () => {
      dispatch(returnRoom());
    },
    onEndMyTurn: () => {
      dispatch(endMyTurn());
    },
  };
};

const Game = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Game;
