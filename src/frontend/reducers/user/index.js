import {
  FETCH_DECK,
} from '../../actions';

const resource = require('../../../game/data');

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
          return resource.unit[unitId];
        })
      ) : null;
      return { ...state, deck };
    }
  }

  return state;
};

export default user;
