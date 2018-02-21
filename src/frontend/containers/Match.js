import { connect } from 'react-redux';
import Component from '../pages/Match/index.jsx';

const mapStateToProps = state => {
  return {
    // _: state.match.room ? state.match.room.state : null,
    room: state.match.room,
    waiting: state.indicator.shown || false,
  };
};

const Match = connect(
  mapStateToProps,
)(Component);

export default Match;
