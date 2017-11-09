import { connect } from 'react-redux';
import Component from '../components/Selector/Selector.jsx';
import { selectUnits } from '../actions';

const mapStateToProps = state => {
  return {
    myDeck: state.me.deck,
    isOffense: state.me.offense,
    opponentsDeck: state.opponent.deck,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSubmit: selectedList => {
      dispatch(selectUnits(selectedList));
    },
  };
};

const Selector = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Selector;
