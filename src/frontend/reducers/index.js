import { combineReducers } from 'redux';
import user from './user';
import match from './match';

export default combineReducers({
  user,
  match,
});
