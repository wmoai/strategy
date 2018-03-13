import Room from '../../game/models/Room.js';

import { 
  CONNECT_SOCKET,
  ENTER_ROOM,
  SYNC_ROOM,
  START_SOLO_PLAY,
  LEAVE_ROOM,
  GET_BATTLE_READY,
  PLAYER_DISCONNECTED,
  SELECT_UNITS,
  END_GAME,
  RETURN_ROOM,
} from '../actions/';

const SCREEN = new Map([
  ['LOBBY', 'LOBBY'],
  ['ROOM', 'ROOM'],
  ['SELECT', 'SELECT'],
  ['BATTLE', 'BATTLE'],
  ['RESULT', 'RESULT'],
]);

const initialState = {
  socket: null,
  userId: null,
  deck: null,
  room: null,
  screen: SCREEN.get('LOBBY'),
  isWatching: false,
  isReady: false,
  isOffense: undefined,
  isMatched: false,
  waiting: false,
  isDisconnected: false,
};

function updateRoom(state, room) {
  const { userId } = state;
  let screen = state.screen;
  if (room.stateIs('ROOM') && state.screen !== 'RESULT') {
    if (room) {
      screen = SCREEN.get('ROOM');
    } else {
      screen = SCREEN.get('LOBBY');
    }
  } else if (room.stateIs('SELECT')) {
    screen = SCREEN.get('SELECT');
  } else if (room.stateIs('BATTLE')) {
    screen = SCREEN.get('BATTLE');
  }
  const me = room.player(userId);
  const isOffense = me ? me.isOffense : undefined;
  return {
    ...state,
    room,
    screen,
    isMatched: room.players.size == 2,
    isOffense,
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
      return { 
        ...state,
        userId: payload.userId,
        isWatching: payload.isWatching ? true : false,
      };
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
    case PLAYER_DISCONNECTED: {
      const { room, isReady } = state;
      if (!room.stateIs('ROOM')) {
        return { ...state, isDisconnected: true };
      } else if (isReady) {
        return { ...state, isDisconnected: true };
      }
      break;
    }
    case END_GAME:
      return {
        ...state,
        screen: SCREEN.get('RESULT'),
        winner: payload.winner
      };
    case RETURN_ROOM:
      return {
        ...state,
        screen: SCREEN.get('ROOM'),
        isReady: false,
        isDisconnected: false,
      };
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
    case END_GAME:
      return {
        ...state,
        screen: SCREEN.get('RESULT'),
        winner: payload.winner
      };
    case RETURN_ROOM:
      return {
        ...state,
        screen: SCREEN.get('LOBBY'),
        room: null
      };
  }
  return state;
}

