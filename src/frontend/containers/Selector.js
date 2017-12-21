import { connect } from 'react-redux';
import Component from '../components/Selector/index.jsx';
import { selectUnits } from '../actions';

import data from '../../game/data';

const mapStateToProps = state => {
  const { me, opponent } = state.match;
  return {
    myUnits: me.deck ? me.deck.map(uid => data.unit[uid]) : [],
    isOffense: me.isOffense,
    opponentUnits : opponent.deck ? opponent.deck.map(uid => data.unit[uid]) : [],
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
