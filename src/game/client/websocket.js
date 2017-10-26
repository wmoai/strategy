import socketIOClient from 'socket.io-client';
const socket = socketIOClient('/game');

const listeningEvents = [
  'init',
  'syncRoom',
  'syncGame',
];

export function init(store) {
  listeningEvents.forEach(type => {
    socket.on(type, payload => {
      store.dispatch({ type: type, payload: payload });
    });
  });
}

export function emit(type, payload) {
  socket.emit(type, payload);
}

