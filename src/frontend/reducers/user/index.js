import {
  FETCH_DECK,
} from '../../actions';

import * as masterData from '../../../game/data';

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
          return masterData.unit[unitId];
        })
      ) : null;
      return { ...state, deck };
    }
  }

  return state;
};

export default user;
