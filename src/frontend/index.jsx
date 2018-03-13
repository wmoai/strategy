import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducers';

import Router from './Router.jsx';
import Client from '../game/client/index.js';


import {
  connectSocket,
  CREATE_ROOM,
  JOIN_ROOM,
  GET_BATTLE_READY,
  SELECT_UNITS,
  END_TURN,
  RETURN_ROOM,
  startWaiting,
  endWaiting,
} from './actions/';
import Websocket from './websocket.js';

const socketMiddleware = store => next => action => {
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
      return state.socket.emit('selectUnits', {list: payload.selectedList});
    case END_TURN:
      return state.socket.emit('endTurn');
    case RETURN_ROOM:
      state.socket.emit('returnRoom');
      break;
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

const contents = document.getElementById('contents');
if (contents) {
  Client.preload().then(() => {
    render(
      <div>
        <style>{'body { margin:0;padding:0; }'}</style>
        <style>{'@import url("https://fonts.googleapis.com/css?family=Anton")'}</style>
        <Provider store={store}>
          <Router />
        </Provider>
      </div>
      , contents
    );
  });
}
