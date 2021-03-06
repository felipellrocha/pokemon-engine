import { handleActions } from 'redux-actions';

import { setIn } from 'timm'; 

const initialState = {
  home: {
    games: [],
  }
};

export default handleActions({
  RECEIVE_GAMES: (state, action) => {
    return setIn(state, ['home', 'games'], action.list);
  },
}, initialState);
