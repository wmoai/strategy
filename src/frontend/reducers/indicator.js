import { 
  START_WAITING,
  END_WAITING,
} from '../actions/';

export default function reducer(state = { shown: false }, action) {
  switch (action.type) {
    case START_WAITING:
      return { ...state, shown: true };
    case END_WAITING:
      return { ...state, shown: false };
  }
  return state;
}
