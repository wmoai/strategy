import * as socket from './websocket.js';
import { 
  INIT_APP,
  SYNC_ROOM,
  SYNC_GAME,
  START_SOLO_PLAY,
  LEAVE_ROOM,
  SELECT_UNITS,
  SELECT_CELL,
  HOVER_CELL,
  END_TURN,
  RETURN_ROOM,
  END_MY_TURN,
} from './actions';

import State from './State.js';

export default function reducer(state = new State(), action) {
  const { payload } = action;
  if (state.isSolo()) {
    return soloPlayReducer(state, action);
  }
  switch (action.type) {
    case INIT_APP:
      return state.init(payload);
    case SYNC_ROOM:
      return state.syncRoom(payload);
    case LEAVE_ROOM:
      return state.leaveRoom();
    case SYNC_GAME:
      return state.syncGame(payload);
    case SELECT_CELL:
      return state.selectCell(payload.cellId, (from, to, target) => {
        socket.emit('act', {
          from: from,
          to: to,
          target: target
        });
      });
    case HOVER_CELL:
      return state.hoverCell(payload.cellId);
    case RETURN_ROOM:
      return state.returnRoom();
    case START_SOLO_PLAY:
      return state.startSoloPlay();
  }
  return state;
}

function soloPlayReducer(state, action) {
  const { payload } = action;
  switch (action.type) {
    case SELECT_UNITS:
      return state.selectUnitSolo(payload.selectedList);
    case SELECT_CELL:
      return state.selectCell(payload.cellId);
    case HOVER_CELL:
      return state.hoverCell(payload.cellId);
    case END_TURN:
      return state.endTurnSolo();
    case END_MY_TURN:
      return state.mightStartAITurn();
    case RETURN_ROOM:
      return state.leaveRoom();
  }
  return state;
}

