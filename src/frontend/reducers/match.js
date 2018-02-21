import Room from '../../game/models/Room.js';

import { 
  CONNECT_SOCKET,
  ENTER_ROOM,
  SYNC_ROOM,
  START_SOLO_PLAY,
  LEAVE_ROOM,
  GET_BATTLE_READY,
  SELECT_UNITS,
  RETURN_ROOM,
} from '../actions/';

const initialState = {
  socket: null,
  userId: null,
  deck: null,
  waiting: false,
  room: null,
  isReady: false,
  me: null,
  opponent: null,
};

function updateRoom(state, room) {
  const { userId } = state;
  return {
    ...state,
    room,
    me: room.player(userId),
    opponent: room.opponent(userId),
  };
}

export default function reducer(state = initialState, action) {
  const { payload } = action;
  if (state.room && state.room.isSolo) {
    return soloPlayReducer(state, action);
  }
  switch (action.type) {
    case CONNECT_SOCKET:
      return { ...state, socket: payload.socket };
    case ENTER_ROOM:
      return { ...state, userId: payload.userId };
    case SYNC_ROOM: {
      return updateRoom(state, Room.restore(payload));
    }
    case LEAVE_ROOM: {
      const { socket, room } = state;
      if (socket && room) {
        socket.emit('leaveRoom', room.id);
        socket.close();
      }
      return {
        ...state,
        room: null,
        socket: null,
      };
    }
    case GET_BATTLE_READY:
      return { ...state, isReady: true };
    case RETURN_ROOM:
      return { ...state, isReady: false };
    case START_SOLO_PLAY: {
      const { id, deck } = payload;
      return updateRoom(
        { ...state, userId: id },
        Room.soloRoom(id, deck)
      );
    }
  }
  return state;
}

function soloPlayReducer(state, action) {
  const { payload } = action;
  switch (action.type) {
    case SELECT_UNITS: {
      const { userId, room } = state;
      const newRoom = room.selectUnits(userId, payload.selectedList).mightEngage();
      return updateRoom(state, newRoom);
    }
    case RETURN_ROOM:
      return { ...state, room: null };
  }
  return state;
}

