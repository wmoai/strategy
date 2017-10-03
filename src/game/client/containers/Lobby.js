import { connect } from 'react-redux';
import Component from '../components/Lobby/Lobby.jsx';

const mapStateToProps = state => {
  return {
    roomId: state.client.roomId
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onCreateRoom: () => {
      dispatch({ type: 'createRoom' });
    },
    onJoinRoom: roomId => {
      dispatch({ type: 'joinRoom', payload: roomId });
    },
    onLeaveRoom: () => {
      dispatch({ type: 'leaveRoom' });
    },
  };
};

const Lobby = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Lobby;
