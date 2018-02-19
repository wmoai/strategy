import {
  FETCH_DECK,
} from '../actions';

import unitData from '../../game/data/unitData.js';

const initialState = {
  userId: null,
  deck: null,
};

const user = (state = initialState, action) => {
  const { payload } = action;
  switch (action.type) {
    case FETCH_DECK: {
      const deck = payload.deck ? (
        payload.deck.map(unitId => {
          return unitData.get(unitId);
        }).filter(data => data != null)
      ) : null;
      return { ...state, deck };
    }
  }

  return state;
};

export default user;
