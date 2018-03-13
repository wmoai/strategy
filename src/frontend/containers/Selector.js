// @flow

import { connect } from 'react-redux';
import Component from '../components/Selector/index.jsx';
import { selectUnits } from '../actions';

import * as masterData from '../../game/data';

const mapStateToProps = state => {
  const { isOffense, room } = state.match;

  const players = Array.from(room.players.values());
  const decks = players.map(player => {
    return {
      isOffense: player.isOffense,
      units: player.deck ? player.deck.map(uid => masterData.unit.get(uid)) : [],
    };
  });
  return {
    isOffense,
    decks,
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
