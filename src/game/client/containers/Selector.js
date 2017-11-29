import { connect } from 'react-redux';
import Component from '../components/Selector/Selector.jsx';
import { selectUnits } from '../actions';

import data from '../../data';

const mapStateToProps = state => {
  return {
    myUnits: state.me.deck ? state.me.deck.map(uid => data.unit[uid]) : [],
    isOffense: state.me.offense,
    opponentUnits : state.opponent.deck ? state.opponent.deck.map(uid => data.unit[uid]) : [],
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
