import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Router from './router';

import { Provider } from 'react-redux';
import configureStore from 'data';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <Router />
  </Provider>,
  document.getElementById('app')
);
