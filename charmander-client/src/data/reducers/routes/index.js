import { routerForBrowser } from 'redux-little-router';

const routes = {
  '/': {
    title: 'Home',
  },
  '/game/:gameId': {
    title: 'Game!!!',
  }
};

const {
  reducer,
  middleware,
  enhancer,
} = routerForBrowser({
  routes,
});


export { reducer, middleware, enhancer };
export default reducer;
