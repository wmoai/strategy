// @flow

import { connect } from 'react-redux';
import Component from '../components/Selector/index.jsx';
import { selectUnits } from '../actions';

import * as masterData from '../../game/data';

const mapStateToProps = state => {
  const { me, opponent } = state.match;
  const myUnits = (me && me.deck) ? me.deck.map(uid => masterData.unit.get(uid)) : [];
  const opponentUnits = (opponent && opponent.deck) ? opponent.deck.map(uid => masterData.unit.get(uid)) : [];
  return {
    myUnits,
    isOffense: me.isOffense,
    opponentUnits,
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
