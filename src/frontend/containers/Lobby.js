import { connect } from 'react-redux';
import Component from '../components/Lobby/index.jsx';

import {
  startSoloPlay,
  createRoom,
  joinRoom,
  leaveRoom,
  getBattleReady,
} from '../actions/';


const mapStateToProps = state => {
  const { room, isWatching, isMatched, isReady } = state.match;
  return {
    roomId: room ? room.id : null,
    isWatching,
    isMatched,
    isReady
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
    onGetReady: () => {
      dispatch(getBattleReady());
    },
  };
};


const Lobby = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);

export default Lobby;
