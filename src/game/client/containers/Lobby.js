import { connect } from 'react-redux';
import Component from '../components/Lobby/Lobby.jsx';
import { createRoom, joinRoom, leaveRoom, ready } from '../actions';

const mapStateToProps = state => {
  return {
    roomId: state.roomId,
    isMatched: state.isMatched,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onCreateRoom: () => {
      dispatch(createRoom());
    },
    onJoinRoom: roomId => {
      dispatch(joinRoom(roomId));
    },
    onLeaveRoom: () => {
      dispatch(leaveRoom());
    },
    onReady: () => {
      dispatch(ready());
    },
  };
};

const Lobby = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Lobby;
