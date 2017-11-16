import {
  initApp,
  syncRoom,
  syncGame,
} from './actions';

import socketIOClient from 'socket.io-client';
const socket = socketIOClient('/game');

const actionsMap = {
  init: initApp,
  syncRoom: syncRoom,
  syncGame: syncGame,
};

export function init(store) {
  Object.keys(actionsMap).forEach(key => {
    socket.on(key, payload => {
      const action = actionsMap[key];
      store.dispatch(action(payload));
    });
  });
}

export function emit(type, payload) {
  socket.emit(type, payload);
}

