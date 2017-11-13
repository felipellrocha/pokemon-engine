import {
  combineReducers,
} from 'redux';

import router from './routes'
import local from './local'

const reducer = combineReducers({
  local,
  router,
});

export default reducer;
