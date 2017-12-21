// import * as socket from '../../websocket.js';
import { 
  CONNECT_SOCKET,
  ENTER_ROOM,
  SYNC_ROOM,
  SYNC_GAME,
  START_SOLO_PLAY,
  LEAVE_ROOM,
  GET_BATTLE_READY,
  SELECT_UNITS,
  SELECT_CELL,
  HOVER_CELL,
  END_TURN,
  RETURN_ROOM,
  // END_MY_TURN,
  // END_ANIMATION,
} from '../../actions/';

import State from './State.js';

export default function reducer(state = new State(), action) {
  const { payload } = action;
  if (state.isSolo()) {
    return soloPlayReducer(state, action);
  }
  switch (action.type) {
    case CONNECT_SOCKET:
      return state.connectSocket(payload.socket);
    case ENTER_ROOM:
      return state.enterRoom(payload.userId);
    case SYNC_ROOM:
      return state.syncRoom(payload);
    case LEAVE_ROOM:
      return state.leaveRoom();
    case SYNC_GAME:
      return state.syncGame(payload.game, payload.action);
    case GET_BATTLE_READY:
      return state.getBattleReady();
    case SELECT_CELL:
      return state.selectCell(payload.cellId, (from, to, target) => {
        state.socket.emit('act', {
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
      return state.startSoloPlay(payload);
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
    // case END_MY_TURN:
      // return state.mightActAI();
    // case END_ANIMATION:
      // if (payload.turn !== state.room.game.turn) {
        // return state;
      // }
      // return state.mightActAI();
    case RETURN_ROOM:
      return state.leaveRoom();
  }
  return state;
}

