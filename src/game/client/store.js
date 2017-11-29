import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import * as socket from './websocket.js';
import reducer from './reducer.js';

import {
  CREATE_ROOM,
  JOIN_ROOM,
  LEAVE_ROOM,
  READY_TO_BATTLE,
  SELECT_UNITS,
  END_TURN,
} from './actions';

export function init() {
  const socketMiddleware = store => next => action => {
    const { payload } = action;
    const state = store.getState();
    if (state.isSolo()) {
      return next(action);
    }
    switch (action.type) {
      case CREATE_ROOM:
        return socket.emit('createRoom');
      case JOIN_ROOM:
        return socket.emit('joinRoom', payload.roomId);
      case LEAVE_ROOM:
        socket.emit('leaveRoom', state.room.id);
        break;
      case READY_TO_BATTLE:
        return socket.emit('readyToBattle');
      case SELECT_UNITS:
        return socket.emit('selectUnits', {list: payload.selectedList});
      case END_TURN:
        return socket.emit('endTurn');
    }
    return next(action);
  };

  return createStore(
    reducer,
    applyMiddleware(
      thunkMiddleware,
      socketMiddleware,
    )
  );
}