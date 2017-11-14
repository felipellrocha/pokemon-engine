import { handleActions } from 'redux-actions';

import { merge } from 'timm'; 

const initialState = {
};

export default handleActions({
  RECEIVE_GAMES: (state, action) => {
    return merge(state, action.games);
  },
}, initialState);
