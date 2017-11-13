import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom'
import classnames from 'classnames';

import {
  Button,
  Sidebar,
  InlineSVG,
  SelectorFooter,
  ScriptDraft,
} from 'components';

import {
  newGame,
  openFile,
} from 'actions';

import styles from './styles.css';
import button from 'components/Button/styles.css';

class component extends PureComponent {

  constructor(props) {
    super(props);

    this.createNewGame = this.createNewGame.bind(this);
    this.loadGame = this.loadGame.bind(this);
  }

  loadGame() {
    const {
      dispatch,
    } = this.props;

    dispatch(openFile())
  }

  createNewGame() {
    const {
      dispatch,
    } = this.props;

    dispatch(newGame())
  }

  render() {
    const {
    } = this.props;

    return (
      <div className={styles.component}>
        <div className="column">
          <h2>Stark Editor</h2>
          <Button
            className={classnames(button.full, button.frame)}
            onClick={this.createNewGame}
          >
            Create new game
          </Button>
          <Button
            className={classnames(button.full, button.frame)}
            onClick={this.loadGame}
          >
            Load game
          </Button>
        </div>
      </div>
    );
  }
}

export default compose(
  connect(state => ({
  })),
  withRouter,
)(component);
