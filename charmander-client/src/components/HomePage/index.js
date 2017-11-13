import React, { Component } from 'react';
import styles from './styles.css';

import {
  Game,
} from 'components';

class HomePage extends Component {
  render() {
    return (
      <div className={styles.component}>
        <Game />
      </div>
    );
  }
}

export default HomePage;
