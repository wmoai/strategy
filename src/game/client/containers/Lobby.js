import { connect } from 'react-redux';
import Component from '../components/Lobby/Lobby.jsx';
import { soloPlay, createRoom, joinRoom, leaveRoom, ready } from '../actions';

const mapStateToProps = state => {
  return {
    userId: state.userId,
    room: state.room,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSoloPlay: () => {
      dispatch(soloPlay());
    },
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
