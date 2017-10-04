import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import App from './containers/App.js';

import * as socket from './websocket.js';
import reducer from './reducer.js';

const socketEmitter = store => next => action => {
  const { payload } = action;
  switch (action.type) {
    case 'createRoom':
      return socket.emit('createRoom');
    case 'joinRoom':
      return socket.emit('joinRoom', payload.roomId);
    case 'leaveRoom':
      socket.emit('leaveRoom', store.getState().roomId);
      break;
    case 'selectUnits':
      return socket.emit('selectUnits', {list: payload.selectedList});
    case 'lineup':
      return socket.emit('lineup', {list: store.getState().controller.game.linedupData()});
    case 'endTurn':
      return socket.emit('endTurn');
  }
  return next(action);
};

const store = createStore(
  reducer,
  applyMiddleware(socketEmitter)
);
socket.init(store);

window.onload = function() {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('contents')
  );
};

