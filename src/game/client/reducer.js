import * as socket from './websocket.js';

import State from './State.js';

export default function reducer(state = new State(), action) {
  const { payload } = action;
  if (state.isSolo()) {
    return soloPlayReducer(state, action);
  }
  switch (action.type) {
    case 'init':
      return state.init(payload);
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
    case 'soloPlay':
      return state.startSoloPlay();
  }
  return state;
}

function soloPlayReducer(state, action) {
  const { payload } = action;
  switch (action.type) {
    case 'selectUnits':
      return state.selectUnitSolo(payload.selectedList);
    case 'selectCell':
      return state.selectCell(payload.cellId);
    case 'hoverCell':
      return state.hoverCell(payload.cellId);
    case 'endTurn':
      return state.endTurnSolo();
    case 'endMyTurn':
      return state.mightStartAITurn();
    case 'returnRoom':
      return state.leaveRoom();
  }
  return state;
}

