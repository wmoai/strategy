import { combineReducers } from 'redux';
import user from './user.js';
import match from './match.js';
import indicator from './indicator.js';

export default combineReducers({
  user,
  match,
  indicator,
});
