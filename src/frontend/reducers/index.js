import { combineReducers } from 'redux';
import user from './user.js';
import match from './match.js';

export default combineReducers({
  user,
  match,
});
