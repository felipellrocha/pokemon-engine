import { handleActions } from 'redux-actions';

import {
  setIn,
} from 'timm';

import {
  EMPTY,
} from 'utils/constants';

import path from 'path';
import electron from 'electron';

import {
  TOGGLE_HIDE_GRID,
  RECEIVE_COMPONENTS,
  SELECT_OBJECT,
  SELECT_SHAPE,
  RECEIVE_ENTITIES,
  CHANGE_INITIAL_TILE,
  SAVE_FILENAME,
  LOAD_STAGE,
  UPDATE_PATHS,
  CHANGE_ZOOM,
  CHANGE_TILING_METHOD,
  CHANGE_TERRAIN,
  SELECT_TILE,
  SELECT_LAYER,
  SELECT_ANIMATION,
  SELECT_FRAME,
  SELECT_MAP,
} from 'actions';

const initialState = {
  filename: '',
  basepath: electron.remote.app.getPath('home'),
  componentFilename: '',
  zoom: .5,
  initialTile: 0,
  selectedMap: 0,
  entities: '',
  selectedObject: null,
  selectedAction: 'put',
  selectedTerrainType: '6-tile',
  selectedTile: [EMPTY, 0],
  selectedLayer: 0,
  selectedAnimation: null,
  selectedFrame: 0,
  selectingShape: false,
  hideGrid: false,
  components: [ ],
  selectedShape: {
    columns: 1,
    rows: 1,
  },
};

export default handleActions({
  TOGGLE_HIDE_GRID: (state, action) => {
    return {
      ...state,
      hideGrid: !state.hideGrid,
    }
  },
  RECEIVE_ENTITIES: (state, action) => {
    return setIn(state, ['entities'], action.text);
  },
  RECEIVE_COMPONENTS: (state, action) => {
    return {
      ...state,
      componentFilename: action.filename,
      components: action.components,
    }
  },
  SELECT_OBJECT: (state, action) => {
    return {
      ...state,
      selectedObject: action.id
    }
  },
  SELECT_SHAPE: (state, action) => {
    return {
      ...state,
      selectedShape: {
        columns: action.columns,
        rows: action.rows,
      }
    };
  },
  SELECT_MAP: (state, action) => {
    return {
      ...state,
      selectedMap: action.index,
    };
  },
  SELECT_FRAME: (state, action) => {
    return {
      ...state,
      selectedFrame: action.index,
    };
  },
  SELECT_ANIMATION: (state, action) => {
    return setIn(state, ['selectedAnimation'], action.index);
  },
  SELECT_LAYER: (state, action) => {
    return Object.assign({}, state, { selectedLayer: action.layer });
  },
  CHANGE_INITIAL_TILE: (state, action) => {
    return {
      ...state,
      initialTileIndex: action.initialTileIndex,
    }
  },
  SELECT_TILE: (state, action) => {
    return Object.assign({}, state, { selectedTile: action.tile });
  },
  CHANGE_TERRAIN: (state, action) => {
    return Object.assign({}, state, { selectedTerrainType: action.terrainType })
  },
  CHANGE_TILING_METHOD: (state, action) => {
    return Object.assign({}, state, { selectedAction: action.method });
  },
  CHANGE_ZOOM: (state, action) => {
    return Object.assign({}, state, { zoom: action.zoom });
  },
  UPDATE_PATHS: (state, action) => {
    return Object.assign({}, state, {
      filename: action.filename,
      basepath: action.basepath,
    });
  },
  SAVE_FILENAME: (state, action) => {
    if (state.filename == action.filename &&
        state.basepath == action.newBasepath) return state;
    return Object.assign({}, state, {
      filename: action.filename,
      basepath: action.newBasepath,
    });
  },
  LOAD_STAGE: (state, action) => {
    if (!action.global) return state;

    return { ...action.global };
  },
}, initialState);
