import axios from 'axios';

export const START_WAITING = 'START_WAITING';
export function startWaiting() {
  return { type: START_WAITING };
}
export const END_WAITING = 'END_WAITING';
export function endWaiting() {
  return { type: END_WAITING };
}

export const FETCH_DECK = 'FETCH_DECK';
export function fetchDeck() {
  return dispatch => {
    dispatch(startWaiting());
    axios.get('/user').then(res => {
      dispatch(endWaiting());
      dispatch({
        type: FETCH_DECK,
        payload: res.data,
      });
    });
  };
}

export function setDeck(ids) {
  return dispatch => {
    dispatch(startWaiting());
    axios.post('/deck', { ids }).then(res => {
      dispatch(endWaiting());
      dispatch({
        type: FETCH_DECK,
        payload: res.data,
      });
    });
  };
}

export const START_SOLO_PLAY = 'START_SOLO_PLAY';
export function startSoloPlay() {
  return dispatch => {
    dispatch(startWaiting());
    axios.get('/user').then(res => {
      dispatch(endWaiting());
      dispatch({
        type: START_SOLO_PLAY,
        payload: res.data,
      });
    });
  };
}

export const CONNECT_SOCKET = 'CONNECT_SOCKET';
export function connectSocket(socket) {
  return {
    type: CONNECT_SOCKET,
    payload: { socket }
  };
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

export const GET_BATTLE_READY = 'GET_BATTLE_READY';
export function getBattleReady() {
  return { type: GET_BATTLE_READY };
}

export const ENTER_ROOM = 'ENTER_ROOM';
export function enterRoom(payload) {
  return {
    type: ENTER_ROOM,
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

export const PLAYER_DISCONNECTED = 'PLAYER_DISCONNECTED';
export function playerDisconnected() {
  return { type: PLAYER_DISCONNECTED };
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
    payload: { cellId }
  };
}

export const HOVER_CELL = 'HOVER_CELL';
export function hoverCell(cellId) {
  return {
    type: HOVER_CELL,
    payload: { cellId }
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

export const END_ANIMATION = 'END_ANIMATION';
export function endAnimation(turn) {
  return dispatch => {
    setTimeout(() => {
      dispatch({
        type: END_ANIMATION,
        payload: { turn }
      });
    }, 300);
  };
}

