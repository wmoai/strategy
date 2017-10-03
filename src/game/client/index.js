import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Record } from 'immutable';
import App from './containers/App.js';

import Client from './Client.js';
import socketIOClient from 'socket.io-client';
const socket = socketIOClient('/game');

const State = Record({
  client: new Client()
});
const initialState = new State();

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case 'createRoom':
      socket.emit('createRoom');
      break;
    case 'enterRoom':
      return state.set('client', state.client.enterRoom(action.payload));
    case 'joinRoom':
      socket.emit('joinRoom', action.payload);
      break;
    case 'leaveRoom':
      socket.emit('leaveRoom', state.client.roomId);
      return state.set('client', state.client.leaveRoom());
    case 'startToElectArmy':
      return state.set('client', state.client.startToElectArmy(action.payload));
    case 'electArmy':
      socket.emit('electArmy', {election: action.payload});
      break;
    case 'startToLineupArmy':
      return state.set('client', state.client.startToLineupArmy(action.payload));
    case 'lineupArmy':
      socket.emit('lineupArmy', {list: state.client.controller.game.linedupData()});
      break;
    case 'selectCell':
      return state.set('client', state.client.selectCell(action.payload, socket));
    case 'hoverCell':
      return state.set('client', state.client.hoverCell(action.payload));
    case 'syncGame':
      return state.set('client', state.client.syncData(action.payload));
    case 'engage':
      return state.set('client', state.client.syncData(action.payload));
    case 'act':
      return state.set('client', state.client.syncData(action.payload));
    case 'rejectAction':
      return state.set('client', state.client.rejectAction());
    case 'endTurn':
      socket.emit('endTurn');
      break;
  }
  return state;
};
const store = createStore(reducer);

socket.on('enterRoom', payload => {
  store.dispatch({ type: 'enterRoom', payload: payload });
});
socket.on('startToElectArmy', payload => {
  store.dispatch({ type: 'startToElectArmy', payload: payload });
});
socket.on('startToLineupArmy', payload => {
  store.dispatch({ type: 'startToLineupArmy', payload: payload });
});
socket.on('engage', payload => {
  store.dispatch({ type: 'syncGame', payload: payload });
});
socket.on('act', payload => {
  store.dispatch({ type: 'syncGame', payload: payload });
});
socket.on('changeTurn', payload => {
  store.dispatch({ type: 'syncGame', payload: payload });
});
socket.on('rejectAction', () => {
  store.dispatch({ type: 'rejectAction' });
});

window.onload = function() {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('contents')
  );
};
