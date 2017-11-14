import { createSelector } from 'reselect';

const getGame = state => state.game;
const getHomeGameList = state => state.local.home.games;

export const getListOfGamesAvailable = createSelector(
  getGame,
  getHomeGameList,
  (games, list) => {
    return list.map(game => games[game])
  }
);
