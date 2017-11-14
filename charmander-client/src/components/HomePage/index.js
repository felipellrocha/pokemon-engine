import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.css';
import { Link } from 'react-router-dom';

import {
 getGames,
} from 'data/actions/game';

import {
  getListOfGamesAvailable,
} from 'data/selectors/game';

class HomePage extends Component {
  componentWillMount() {
    const {
      getGames,
    } = this.props;

    getGames();
  }

  render() {
    const {
      games,
    } = this.props;

    return (
      <div className={styles.component}>
        <div className="games">
          {games.map(game => (
            <div className="game" key={game.id}>
              <div className="row">
                <div>Game id:</div>
                <Link to={`/game/${game.id}`}>{ game.id }</Link>
              </div>

              <div className="row">
                <div>Connected players:</div>
                <div>{ game.number_of_clients }</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  games: getListOfGamesAvailable(state),
});

const mapDispatchToProps = dispatch => ({
  getGames: () => dispatch(getGames()),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
