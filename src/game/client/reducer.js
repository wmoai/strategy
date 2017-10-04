import { Record } from 'immutable';
import Step from './Step.js';
import Controller from './Controller.js';
import * as socket from './websocket.js';

const State = Record({
  step: Step.get('LOBBY'),
  roomId: null,
  player: null,
  opponent: null,
  controller: null,
});

export default function reducer(state = new State(), action) {
  const { payload } = action;
  switch (action.type) {
    case 'enterRoom':
      return state.set('roomId', payload.roomId);
    case 'leaveRoom':
      return state.withMutations(mnt => {
        mnt.delete('roomId')
          .delete('controller');
      });
    case 'startToSelectUnits':
      return state.withMutations(mnt => {
        const { you, opponent } = payload;
        mnt.set('step', Step.get('SELECT'))
          .set('player', you)
          .set('opponent', opponent);
      });
    case 'startToLineup':
      return state.withMutations(mnt => {
        mnt.set('step', Step.get('GAME'))
          .set('controller', new Controller().set('offense', mnt.player.offense).sync(payload));
      });
    case 'selectCell':
      return state.set('controller', 
        state.controller.selectCell(payload.cellId, (from, to, target) => {
          socket.emit('act', {
            from: from,
            to: to,
            target: target
          });
        })
      );
    case 'hoverCell':
      return state.set('controller', state.controller.hoverCell(payload.cellId));
    case 'syncGame':
    case 'engage':
    case 'act':
      return state.set('controller', state.controller.sync(payload));
    case 'rejectAction':
      return state.set('controller', state.controller.clearUI());
  }
  return state;
}
