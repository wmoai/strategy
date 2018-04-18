// @flow

import { connect } from 'react-redux';
import Component from '../components/Selector/index.jsx';
import { selectUnit, selectUnits } from '../actions';

import * as masterData from '../../game/data';

const mapStateToProps = state => {
  const { isOffense, room } = state.match;
  const { selected, isEmitted } = state.selector;

  const players = Array.from(room.players.values());
  const decks = players.map(player => {
    return {
      isOffense: player.isOffense,
      units: player.deck ? player.deck.map(uid => masterData.unit.get(uid)) : []
    };
  });
  return {
    costLimit: 24,
    isOffense,
    myDeck: decks.filter(deck => deck.isOffense === isOffense).pop(),
    otherDecks: decks.filter(deck => deck.isOffense !== isOffense),
    selected,
    isEmitted
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSelectUnit: index => {
      dispatch(selectUnit(index));
    },
    onSubmit: selectedList => {
      dispatch(selectUnits(selectedList));
    }
  };
};

const Selector = connect(mapStateToProps, mapDispatchToProps)(Component);

export default Selector;
