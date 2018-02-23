import { connect } from 'react-redux';
import Component from '../pages/Match/index.jsx';

import { returnRoom } from '../actions';

const mapStateToProps = state => {
  return {
    _: state.match.room ? state.match.room.state : null,
    room: state.match.room,
    waiting: state.indicator.shown || false,
    isDisconnected: state.match.isDisconnected || false,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onReturnRoom: () => {
      dispatch(returnRoom());
    },
  };
};


const Match = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);

export default Match;
