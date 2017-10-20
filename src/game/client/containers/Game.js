import { connect } from 'react-redux';
import Component from '../components/Game/Game.jsx';
import {
  selectCell,
  hoverCell,
  lineup,
  endTurn,
  returnRoom,
} from '../actions';

const mapStateToProps = state => {
  return {
    controller: state.controller,
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
    onLineup: () => {
      dispatch(lineup());
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
