import { connect } from 'react-redux';
import Component from '../components/Lobby/Lobby.jsx';
import { createRoom, joinRoom, leaveRoom } from '../actions';

const mapStateToProps = state => {
  return {
    roomId: state.roomId
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
  };
};

const Lobby = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Lobby;
