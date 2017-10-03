import React from 'react';
import MicroContainer from 'react-micro-container';
import { render } from 'react-dom';

import socketIOClient from 'socket.io-client';
const socket = socketIOClient('/game');
import Client from './Client.js';

import Lobby from './screens/Lobby/Lobby.jsx';
import Preparation from './screens/Preparation/Preparation.jsx';
import GameScreen from './screens/Game/Game.jsx';

class Container extends MicroContainer {
  constructor(props) {
    super(props);
    this.state = {
      client: new Client(),
    };
  }

  updateClient(client) {
    this.setState({
      client: client,
    });
  }

  componentDidMount() {
    socket.on('enterRoom', data => {
      this.updateClient(this.state.client.enterRoom(data));
    });
    socket.on('startToElectArmy', data => {
      this.updateClient(this.state.client.startToElectArmy(data));
    });
    socket.on('startToLineupArmy', data => {
      this.updateClient(this.state.client.startToLineupArmy(data));
    });
    socket.on('engage', data => {
      this.updateClient(this.state.client.syncData(data));
    });
    socket.on('act', data => {
      this.updateClient(this.state.client.syncData(data));
    });
    socket.on('changeTurn', data => {
      this.updateClient(this.state.client.syncData(data));
    });
    socket.on('rejectAction', () => {
      this.updateClient(this.state.client.rejectAction());
    });

    this.subscribe({
      createRoom: () => { socket.emit('createRoom'); },
      leaveRoom: () => {
        socket.emit('leaveRoom', this.state.client.roomId);
        this.updateClient(this.state.client.leaveRoom());
      },
      joinRoom: roomId => { socket.emit('joinRoom', roomId); },
      electArmy: election => { socket.emit('electArmy', {election: election}); },
      lineupArmy: list => { socket.emit('lineupArmy', {list: list}); },
      selectCell: cellId => { this.updateClient(this.state.client.selectCell(cellId, socket)); },
      hoverCell: cellId => { this.updateClient(this.state.client.hoverCell(cellId)); },
      endTurn: () => { socket.emit('endTurn'); },
    });
  }

  render() {
    if (this.state.client.stateIs('PREPARATION')) {
      return (
        <Preparation 
          dispatch={this.dispatch}
          {...this.state.client.props()}
          costLimit={16}
        />
      );
    } else if (this.state.client.stateIs('GAME')) {
      return (
        <GameScreen
          dispatch={this.dispatch}
          {...this.state.client.props()}
        />
      );
    }
    return (
      <Lobby
        dispatch={this.dispatch}
        {...this.state.client.props()}
      />
    );
  }
}

window.onload = function() {
  render(
    <Container />,
    document.getElementById('contents')
  );
};
