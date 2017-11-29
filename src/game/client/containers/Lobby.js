import { connect } from 'react-redux';
import Component from '../components/Lobby/Lobby.jsx';
import { startSoloPlay, createRoom, joinRoom, leaveRoom, readyToBattle } from '../actions';

const mapStateToProps = state => {
  const { room, me, opponent } = state;
  return {
    roomId: room ? room.id : null,
    isMatched: (me && opponent),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClickSoloPlay: () => {
      dispatch(startSoloPlay());
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
      dispatch(readyToBattle());
    },
  };
};

const Lobby = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component);

export default Lobby;
