import {
  connectSocket,
  CREATE_ROOM,
  JOIN_ROOM,
  GET_BATTLE_READY,
  SELECT_UNITS,
  END_TURN,
  RETURN_ROOM,
  startWaiting,
  endWaiting
} from './actions/';
import Websocket from './websocket.js';

export default store => next => action => {
  const { payload } = action;
  const state = store.getState().match;
  if (state.room && state.room.isSolo) {
    return next(action);
  }
  switch (action.type) {
    case CREATE_ROOM: {
      const socket = new Websocket(store.dispatch);
      store.dispatch(startWaiting());
      socket.emit('createRoom', () => {
        store.dispatch(endWaiting());
      });
      return store.dispatch(connectSocket(socket));
    }
    case JOIN_ROOM: {
      const socket = new Websocket(store.dispatch);
      store.dispatch(startWaiting());
      socket.emit('joinRoom', payload.roomId, () => {
        store.dispatch(endWaiting());
      });
      return store.dispatch(connectSocket(socket));
    }
    case GET_BATTLE_READY:
      state.socket.emit('getBattleReady');
      break;
    case SELECT_UNITS:
      state.socket.emit('selectUnits', { list: payload.selectedList });
      break;
    case END_TURN:
      return state.socket.emit('endTurn');
    case RETURN_ROOM:
      state.socket.emit('returnRoom');
      break;
  }
  return next(action);
};
