import * as socket from './websocket.js';

import State from './State.js';

export default function reducer(state = new State(), action) {
  const { payload } = action;
  switch (action.type) {
    case 'init':
      return state.init(payload.userId);
    case 'syncRoom':
      return state.syncRoom(payload);
    case 'leaveRoom':
      return state.leaveRoom();
    case 'syncGame':
      return state.syncGame(payload);
    case 'selectCell':
      return state.selectCell(payload.cellId, (from, to, target) => {
        socket.emit('act', {
          from: from,
          to: to,
          target: target
        });
      });
    case 'hoverCell':
      return state.hoverCell(payload.cellId);
    case 'returnRoom':
      return state.returnRoom();
  }
  return state;
}
