import {
  enterRoom,
  syncRoom,
} from './actions/';

import socketIOClient from 'socket.io-client';

const actionsMap = {
  enterRoom,
  syncRoom,
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

  on(...args) {
    this.socket.on(...args);
  }

  emit(...args) {
    this.socket.emit(...args);
  }

  close() {
    this.socket.close();
  }
}

