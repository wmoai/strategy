import {
  INIT_GAME,
  RUN_GAME,
  CHANGE_TURN,
  HOVER_GAME,
  END_GAME
} from '../actions/';

const initialState = {
  isIntroduction: true,
  turn: true,
  turnRemained: 0,
  winner: undefined,
  hoveredUnit: null,
  hoveredTerrain: null,
  actionForecast: null
};

export default function reducer(state = initialState, action) {
  const { payload } = action;
  switch (action.type) {
    case INIT_GAME:
      return {
        ...state,
        isIntroduction: true,
        turnRemained: 0,
        winner: undefined
      };
    case RUN_GAME:
      return {
        ...state,
        isIntroduction: false
      };
    case CHANGE_TURN:
      return {
        ...state,
        turn: payload.turn,
        turnRemained: payload.turnRemained
      };
    case HOVER_GAME:
      return {
        ...state,
        hoveredUnit: payload.unit,
        hoveredTerrain: payload.terrain,
        actionForecast: payload.forecast
      };
    case END_GAME:
      return {
        ...state,
        winner: payload.winner
      };
  }
  return state;
}
