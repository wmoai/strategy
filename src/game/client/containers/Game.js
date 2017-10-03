import { connect } from 'react-redux';
import Component from '../components/Game/Game.jsx';

const mapStateToProps = state => {
  return state.client.props();
};

const mapDispatchToProps = dispatch => {
  return {
    onSelectCell: cellId => {
      dispatch({ type: 'selectCell', payload: cellId });
    },
    onHoverCell: cellId => {
      dispatch({ type: 'hoverCell', payload: cellId });
    },
    onLineup: () => {
      dispatch({ type: 'lineupArmy' });
    },
    onEndTurn: () => {
      dispatch({ type: 'endTurn' });
    },
  };
};

const Game = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Game;
