import { combineReducers } from 'redux';
import user from './user.js';
import match from './match.js';
import game from './game.js';
import selector from './selector.js';
import indicator from './indicator.js';

export default combineReducers({
  user,
  match,
  game,
  selector,
  indicator
});
