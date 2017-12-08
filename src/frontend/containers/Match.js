import { connect } from 'react-redux';
import Component from '../pages/Match/index.jsx';

const mapStateToProps = state => {
  return {
    room: state.match.room
  };
};

const Match = connect(
  mapStateToProps,
)(Component);

export default Match;
