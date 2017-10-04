
import { Record } from 'immutable';

const State = Record({
  roomId: null,
  player: null,
  opponent: null,
});

export default function lobby(state = new State(), action) {
  switch (action.type) {
    case 'enterRoom':
      return state.set('roomId', action.payload);
    case 'leaveRoom':
      return state.delete('roomId');
    case 'startToSelectUnits':
      return state.withMutations(mnt => {
        const { you, opponent } = action.payload;
        mnt.set('player', you)
          .set('opponent', opponent);
      });
  }
  return state;
}
