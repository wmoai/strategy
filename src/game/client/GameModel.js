import { Record } from 'immutable';
// import Game from '../Game.js';

export default class GameModel extends Record({
  game: null,
  trun: 0,
  phase: 0,
  map: null,
}) {

}

