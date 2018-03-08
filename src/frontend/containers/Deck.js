import { connect } from 'react-redux';
import Component from '../pages/Deck/index.jsx';

import {
  fetchDeck,
  setDeck,
} from '../actions/';

import { unit as unitsData } from '../../game/data/';

const mapStateToProps = state => {
  return {
    deck: state.user ? state.user.deck : null,
    waiting: state.indicator.shown || false,
    unitsData: Array.from(unitsData.values()),
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onInit: () => {
      dispatch(fetchDeck());
    },
    onClickSaveDeck: (ids) => {
      dispatch(setDeck(ids));
    },
  };
};


const Deck = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);

export default Deck;
