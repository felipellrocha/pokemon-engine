import {
  createStore,
  applyMiddleware,
  compose,
} from 'redux';

import {
  middleware as routesMiddleware,
  enhancer as routesEnhancer,
} from 'data/reducers/routes';

import thunk from 'redux-thunk';

import rootReducer from 'data/reducers';

export default initialState => {
  const middlewares = [];
  const enhancers = [];

  middlewares.push(routesMiddleware);
  middlewares.push(thunk);

  if (window.__REDUX_DEVTOOLS_EXTENSION__) enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());

  enhancers.push(routesEnhancer);
  enhancers.push(applyMiddleware(...middlewares));

  const enhancer = compose(...enhancers);

  return createStore(rootReducer, initialState, enhancer);
};
