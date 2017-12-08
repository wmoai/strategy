import {
  enterRoom,
  syncRoom,
  syncGame,
} from './actions/';

import socketIOClient from 'socket.io-client';

const actionsMap = {
  enterRoom,
  syncRoom,
  syncGame,
};

export default class Websocket {
  constructor(dispatch) {
    this.socket = socketIOClient('/game');

    Object.keys(actionsMap).forEach(key => {
      this.socket.on(key, payload => {
        const action = actionsMap[key];
        dispatch(action(payload));
      });
    });
  }

  emit(type, payload) {
    this.socket.emit(type, payload);
  }

  close() {
    this.socket.close();
  }
}

