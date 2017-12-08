import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducers';

import Router from './Router.jsx';
import Renderer from './Renderer';


require('../game/data').init();
import {
  connectSocket,
  CREATE_ROOM,
  JOIN_ROOM,
  READY_TO_BATTLE,
  SELECT_UNITS,
  END_TURN,
} from './actions/';
import Websocket from './websocket.js';

const socketMiddleware = store => next => action => {
  const { payload } = action;
  const state = store.getState().match;
  if (state.isSolo()) {
    return next(action);
  }
  switch (action.type) {
    case CREATE_ROOM: {
      const socket = new Websocket(store.dispatch);
      socket.emit('createRoom');
      return store.dispatch(connectSocket(socket));
    }
    case JOIN_ROOM: {
      const socket = new Websocket(store.dispatch);
      socket.emit('joinRoom', payload.roomId);
      return store.dispatch(connectSocket(socket));
    }
    case READY_TO_BATTLE:
      return state.socket.emit('readyToBattle');
    case SELECT_UNITS:
      return state.socket.emit('selectUnits', {list: payload.selectedList});
    case END_TURN:
      return state.socket.emit('endTurn');

  }
  return next(action);
};
const store = createStore(
  reducer,
  applyMiddleware(
    thunkMiddleware,
    socketMiddleware,
  )
);

/*
import {
  CREATE_ROOM,
  JOIN_ROOM,
  LEAVE_ROOM,
  READY_TO_BATTLE,
  SELECT_UNITS,
  END_TURN,
} from './actions/game.js';
import * as socket from './websocket.js';

const socketMiddleware = store => next => action => {
  const { payload } = action;
  const state = store.getState().game;
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


const store = createStore(
  reducer,
  applyMiddleware(
    thunkMiddleware,
    socketMiddleware,
  )
);
socket.init(store);
*/


document.addEventListener('DOMContentLoaded', () => {
  Renderer.preload().then(() => {
    render(
      <Provider store={store}>
        <Router />
      </Provider>,
      document.getElementById('contents')
    );
  });
});
