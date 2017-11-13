import { combineReducers } from 'redux';
import app from './app';
import global from './global';
import tilemap from './tilemap';

const sliceReducer = combineReducers({
  app,
  tilemap,
  global,
});

export default sliceReducer;
