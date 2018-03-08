import { connect } from 'react-redux';
import Component from '../pages/Top/index.jsx';

import { fetchDeck } from '../actions/';

const mapStateToProps = state => {
  return {
    deck: state.user ? state.user.deck : null,
    waiting: state.indicator.shown || false,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onInit: () => {
      dispatch(fetchDeck());
    },
  };
};

const Top = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Top;
