import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.css';

import {
  Game,
} from 'components';

class GamePage extends Component {
  render() {
    const {
      gameId,
    } = this.props;

    return (
      <div className={styles.component}>
        <Game gameId={gameId} />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  console.log(state);
  return {
    gameId: props.match.params.gameId,
  }
};

export default connect(mapStateToProps)(GamePage);
