import {
  FETCH_DECK,
} from '../../actions';

import State from './State.js';
const resource = require('../../../game/data').init();

const user = (state = new State(), action) => {
  const { payload } = action;
  switch (action.type) {
    case FETCH_DECK: {
      const deck = payload.deck ? (
        payload.deck.map(unitId => {
          return resource.unit[unitId];
        })
      ) : null;
      return state.set('deck', deck);

    }
  }

  return state;
};

export default user;
