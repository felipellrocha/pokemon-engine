import React, { Component } from 'react';
import { Fragment } from 'redux-little-router';

import {
  HomePage,
} from 'components';

class Router extends Component {
  render() {
    return (
      <div>
        <Fragment forRoute='/'><HomePage /></Fragment>
      </div>
    );
  }
}

export default Router;
