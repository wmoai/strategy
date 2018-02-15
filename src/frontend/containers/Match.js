import { connect } from 'react-redux';
import Component from '../pages/Match/index.jsx';

const mapStateToProps = state => {
  return {
    _: state.match.room ? state.match.room.state : null,
    room: state.match.room
  };
};

const Match = connect(
  mapStateToProps,
)(Component);

export default Match;
