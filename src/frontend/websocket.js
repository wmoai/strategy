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
        console.log(key);
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

