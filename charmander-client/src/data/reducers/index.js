import {
  combineReducers,
} from 'redux';

import router from './routes'
import game from './game'
import local from './local'

const reducer = combineReducers({
  game,
  router,
  local,
});

export default reducer;
