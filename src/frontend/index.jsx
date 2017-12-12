import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducers';

import Router from './Router.jsx';
import Renderer from './Renderer';


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

Renderer.preload().then(() => {
  render(
    <Provider store={store}>
      <Router />
    </Provider>,
    document.getElementById('contents')
  );
});
