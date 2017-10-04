import socketIOClient from 'socket.io-client';
const socket = socketIOClient('/game');

const listeningEvents = [
  'enterRoom',
  'startToSelectUnits',
  'startToLineup',
  'engage',
  'act',
  'changeTurn',
  'rejectAction',
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

