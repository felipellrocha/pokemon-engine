import { routerForBrowser } from 'redux-little-router';

const routes = {
  '/': {
    title: 'Home',
  },
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
