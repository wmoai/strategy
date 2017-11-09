import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import App from './containers/App.js';

import * as socket from './websocket.js';
import reducer from './reducer.js';

require('../data').init();

const middleware = store => next => action => {
  const { payload } = action;
  const state = store.getState();
  if (state.isSolo()) {
    return next(action);
  }
  switch (action.type) {
    case 'createRoom':
      return socket.emit('createRoom');
    case 'joinRoom':
      return socket.emit('joinRoom', payload.roomId);
    case 'leaveRoom':
      socket.emit('leaveRoom', state.room.id);
      break;
    case 'ready':
      return socket.emit('ready');
    case 'selectUnits':
      return socket.emit('selectUnits', {list: payload.selectedList});
    case 'endTurn':
      return socket.emit('endTurn');
  }
  return next(action);
};

const store = createStore(
  reducer,
  applyMiddleware(middleware)
);
socket.init(store);

document.addEventListener('DOMContentLoaded', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('contents')
  );
});

