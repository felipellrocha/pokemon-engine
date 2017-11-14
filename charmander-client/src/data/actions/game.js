import pidgeot from 'requests/pidgeot';
import {
  GameSchema,
} from 'data/normalizers';

import { normalize } from 'normalizr';

export const getGames = () => {
  return async dispatch => {
    const { data } = await pidgeot.get('/games');
    
    const normal = normalize(data.connections, [GameSchema]);

    dispatch(receiveGames(normal.entities.game, normal.result));
  }
};

export const receiveGames = (games, list) => ({
  type: 'RECEIVE_GAMES',
  games,
  list,
});
