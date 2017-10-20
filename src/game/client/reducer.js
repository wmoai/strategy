import { Record } from 'immutable';
import Step from './Step.js';
import Controller from './Controller.js';
import * as socket from './websocket.js';

const State = Record({
  step: new Step(),
  roomId: null,
  isMatched: false,
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
          .delete('player')
          .delete('opponent')
          .delete('controller')
          .set('isMatched', false);
      });
    case 'matched':
      return state.set('isMatched', true);
    case 'unmatched':
      return state.set('isMatched', false);
    case 'startToSelectUnits':
      return state.withMutations(mnt => {
        const { you, opponent } = payload;
        mnt.set('step', mnt.step.forward())
          .set('player', you)
          .set('opponent', opponent);
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
    case 'engage':
      return state.withMutations(mnt => {
        mnt.set('step', mnt.step.forward())
          .set('controller', new Controller().set('offense', mnt.player.offense).sync(payload));
      });
    case 'act':
    case 'changeTurn':
      return state.set('controller', state.controller.sync(payload));
    case 'rejectAction':
      return state.set('controller', state.controller.clearUI());
    case 'returnRoom':
      return state.withMutations(mnt => {
        mnt.set('step', mnt.step.forward())
          .delete('player')
          .delete('opponent')
          .delete('controller');
      });
  }
  return state;
}
