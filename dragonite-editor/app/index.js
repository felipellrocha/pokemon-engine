import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store/configureStore';

import {
  App,
} from './components';

const store = configureStore();

render(
  <AppContainer>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </AppContainer>,
  document.getElementById('root')
);
