import { Record, Map } from 'immutable';
import Controller from './Controller.js';

const STATE = Map({
  LOBBY: 1,
  PREPARATION: 10,
  GAME: 20,
});

export default class Client extends Record({
  state: STATE.get('LOBBYY'),
  roomId: null,
  player: null,
  opponent: null,
  controller: null,
  onUpdate: () => {},
}) {

  props() {
    return {
      roomId: this.roomId,
      player: this.player,
      opponent: this.opponent,
      controller: this.controller,
    };
  }

  stateIs(str) {
    return this.state == STATE.get(str);
  }

  enterRoom({ roomId }) {
    return this.set('roomId', roomId);
  }

  leaveRoom() {
    return this.withMutations(mnt => {
      mnt.delete('roomId')
        .delete('controller');
    });
  }

  startToElectArmy({ you, opponent }) {
    return this.withMutations(mnt => {
      mnt.set('state', STATE.get('PREPARATION'))
        .set('player', you)
        .set('opponent', opponent);
    });
  }

  startToLineupArmy(data) {
    return this.withMutations(mnt => {
      mnt.set('state', STATE.get('GAME'))
        .set('controller', new Controller().set('offense', this.player.offense).sync(data));
    });
  }

  syncData(data) {
    return this.set('controller', this.controller.sync(data));
  }

  rejectAction() {
    return this.set('controller', this.controller.clearUI());
  }

  selectCell(cellId, socket) {
    return this.set('controller', 
      this.controller.selectCell(cellId, (from, to, target) => {
        socket.emit('act', {
          from: from,
          to: to,
          target: target
        });
      })
    );
  }

  hoverCell(cellId) {
    return this.set('controller', this.controller.hoverCell(cellId));
  }

}
