export const INIT_APP = 'INIT_APP';
export function initApp(payload) {
  return {
    type: INIT_APP,
    payload: payload
  };
}

export const SYNC_ROOM = 'SYNC_ROOM';
export function syncRoom(payload) {
  return {
    type: SYNC_ROOM,
    payload: payload
  };
}

export const SYNC_GAME = 'SYNC_GAME';
export function syncGame(payload) {
  return {
    type: SYNC_GAME,
    payload: payload
  };
}

export const START_SOLO_PLAY = 'START_SOLO_PLAY';
export function startSoloPlay() {
  return { type: START_SOLO_PLAY };
}

export const CREATE_ROOM = 'CREATE_ROOM';
export function createRoom() {
  return { type: CREATE_ROOM };
}

export const JOIN_ROOM = 'JOIN_ROOM';
export function joinRoom(roomId) {
  return {
    type: JOIN_ROOM,
    payload: { roomId: roomId }
  };
}

export const LEAVE_ROOM = 'LEAE_ROOM';
export function leaveRoom() {
  return { type: LEAVE_ROOM };
}

export const READY_TO_BATTLE = 'READY_TO_BATTLE';
export function readyToBattle() {
  return { type: READY_TO_BATTLE };
}

export const SELECT_UNITS = 'SELECT_UNITS';
export function selectUnits(selectedList) {
  return {
    type: SELECT_UNITS,
    payload: { selectedList: selectedList }
  };
}

export const SELECT_CELL = 'SELECT_CELL';
export function selectCell(cellId) {
  return {
    type: SELECT_CELL,
    payload: { cellId: cellId }
  };
}

export const HOVER_CELL = 'HOVER_CELL';
export function hoverCell(cellId) {
  return {
    type: HOVER_CELL,
    payload: { cellId: cellId }
  };
}

export const END_TURN = 'END_TURN';
export function endTurn() {
  return { type: END_TURN };
}

export const RETURN_ROOM = 'RETURN_ROOM';
export function returnRoom() {
  return { type: RETURN_ROOM };
}

export const END_MY_TURN = 'END_MY_TURN';
export function endMyTurn() {
  return dispatch => {
    setTimeout(() => {
      dispatch({
        type: END_MY_TURN
      });
    }, 1200);
  };
}

