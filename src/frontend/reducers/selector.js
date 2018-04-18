import { SELECT_UNIT, SELECT_UNITS, RETURN_ROOM } from '../actions/';

const initialState = {
  selected: [],
  isEmitted: false
};

export default function reducer(state = initialState, action) {
  const { payload } = action;
  switch (action.type) {
    case SELECT_UNIT: {
      const { index } = payload;
      const indexOf = state.selected.indexOf(index);
      let selected;
      if (indexOf >= 0) {
        selected = state.selected.filter((sel, i) => {
          return i != indexOf;
        });
      } else {
        selected = state.selected.concat(index);
      }
      return { ...state, selected };
    }
    case SELECT_UNITS:
      return { ...state, isEmitted: true };
    case RETURN_ROOM:
      return {
        ...state,
        selected: [],
        isEmitted: false
      };
  }
  return state;
}
