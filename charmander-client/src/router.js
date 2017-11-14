import React, { Component } from 'react';
import {
  BrowserRouter,
  Route,
} from 'react-router-dom';

import {
  HomePage,
  GamePage,
} from 'components';

class Router extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Route path='/' exact component={HomePage} />
          <Route path='/game/:gameId' component={GamePage} />
        </div>
      </BrowserRouter>
    );
  }
}

export default Router;
