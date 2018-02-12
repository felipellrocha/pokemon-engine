import { handleActions } from 'redux-actions';

import path from 'path';

import {
  addLast,
  updateIn,
  setIn,
} from 'timm';

import {
  arrayReplace,
  arrayRemove,
	UUID,
  getFrame,
} from 'utils';

import {
  ADD_ENTITY,
  CHANGE_ENTITY_NAME,

  RECEIVE_COMPONENT,
  CHANGE_COMPONENT_VALUE,
  REMOVE_COMPONENT,

  ADD_ANIMATION,
  CHANGE_ANIMATION_NAME,
  CHANGE_ANIMATION_FRAME_LENGTH,
  CHANGE_ANIMATION_SPRITESHEET,
  MOVE_SPRITE,
  CREATE_KEYFRAME,
  DELETE_KEYFRAME,

  CHANGE_GAME_NAME,
  CHANGE_TILE_WIDTH,
  CHANGE_TILE_HEIGHT,
  CHANGE_INITIAL_MAP,
  CHANGE_TILESET_TYPE,

  ADD_TERRAIN,

  RECEIVE_TILESETS,
  CHANGE_TILESET_NAME,

  SAVE_FILENAME,
  LOAD_STAGE,

  RECEIVE_NEW_MAP,
  UPDATE_MAP_NAME,

  RECEIVE_SPRITE_SHEETS,
} from 'actions';

const initialState = {
  name: 'Untitled',
  tile: {
    width: 16,
    height: 16,
  },
  tilesets: [ ],
  sheets: [ ],
  maps: [ ],
  animations: [ ],
  entities: [ ],
  initialMap: 0,
};

initialState.maps = ['start'].map(name => ({
  id: name,
  name,
}));

export default handleActions({
  RECEIVE_ENTITIES: (state, action) => {
    return setIn(state, ['entities'], action.objects);
  },
  ADD_ENTITY: (state, action) => {
    return {
      ...state,
      entities: {
        ...state.entities,
        [UUID()]: {
          name: 'untitled',
          avatar: null,
          components: [ ],
        },
      },
    }
  },
  RECEIVE_COMPONENT: (state, action) => {
    return {
      ...state,
      entities: {
        ...state.entities,
        [action.id]: {
          ...state.entities[action.id],
          components: [
            ...state.entities[action.id].components,
            action.component,
          ],
        }
      }
    }
  },
  CHANGE_ENTITY_NAME: (state, action) => {
    return {
      ...state,
      entities: {
        ...state.entities,
        [action.id]: {
          ...state.entities[action.id],
          name: action.name,
        }
      }
    }
  },
  CHANGE_COMPONENT_VALUE: (state, action) => {
    const components = state.entities[action.id].components;
    const component = components[action.componentIndex];
    const members = component.members;
    const member = members[action.memberIndex];
    return {
      ...state,
      entities: {
        ...state.entities,
        [action.id]: {
          ...state.entities[action.id],
          components: [
            ...components.slice(0, action.componentIndex),
            {
              ...component,
              members: {
                ...members,
                [action.memberIndex]: {
                  ...member,
                  value: action.value,
                }
              },
            },
            ...components.slice(action.componentIndex + 1, components.length),
          ]
        }
      }
    }
  },
  REMOVE_COMPONENT: (state, action) => {
    return {
      ...state,
      entities: {
        ...state.entities,
        [action.id]: {
          ...state.entities[action.id],
          components: arrayRemove(state.entities[action.id].components, action.componentIndex),
        }
      }
    }
  },
  RECEIVE_NEW_MAP: (state, action) => {
    const {
      id,
      name,
    } = action;

    return {
      ...state,
      maps: [
        ...state.maps,
        {
          id,
          name,
        }
      ]
    }
  },
  UPDATE_MAP_NAME: (state, action) => {
    const {
      index,
      name,
    } = action;

    const map = state.maps[index];
    return {
      ...state,
      maps: arrayReplace(state.maps, {
        ...map,
        name,
      }, index),
    }
  },
  ADD_ANIMATION: (state, action) => {
    const newAnimation = {
      id: UUID(),
      name: action.name,
      numberOfFrames: 32,
      sheet: 0,
      spritesheet: 0,
      keyframes: {
        0: {
          x: 0,
          y: 0,
          w: state.tile.width,
          h: state.tile.height,
        },
      },
    };
    return updateIn(state, ['animations'], prev => addLast(prev, newAnimation));
  },
  CHANGE_ANIMATION_FRAME_LENGTH: (state, action) => {
    return setIn(state, ['animations', action.index, 'numberOfFrames'], parseInt(action.numberOfFrames));
  },
  CHANGE_ANIMATION_SPRITESHEET: (state, action) => {
    return setIn(state, ['animations', action.index, 'spritesheet'], parseInt(action.sheet));
  },
  CHANGE_ANIMATION_NAME: (state, action) => {
    return setIn(state, ['animations', action.index, 'name'], parseInt(action.name));
  },
  DELETE_KEYFRAME: (state, action) => {
    const {
      selectedAnimation,
      selectedFrame,
    } = action;

    if (!state.animations[selectedAnimation].keyframes[selectedFrame]) return state;
    if (selectedFrame === 0) return state;

    const {
      animations: {
        [selectedAnimation]: {
          keyframes
        }
      }
    } = state;

    const newFrames = Object.assign({}, keyframes);
    delete newFrames[selectedFrame];

    return {
      ...state,
      animations: {
        ...state.animations,
        [selectedAnimation]: {
          ...state.animations[selectedAnimation],
          keyframes: newFrames,
        }
      }
    }
  },
  MOVE_SPRITE: (state, action) => {
    const {
      selectedAnimation,
      selectedFrame,
      coord,
    } = action;

    const frame = getFrame(state.animations[selectedAnimation].keyframes, selectedFrame);

    return setIn(state, ['animations', selectedAnimation, 'keyframes', selectedFrame], {...frame, ...coord});
  },
  CHANGE_TILE_WIDTH: (state, action) => {
    return {
      ...state,
      tile: {
        ...state.tile,
        width: action.value,
      }
    }
  },
  CHANGE_TILE_HEIGHT: (state, action) => {
    return {
      ...state,
      tile: {
        ...state.tile,
        height: action.value,
      }
    }
  },
  CHANGE_INITIAL_MAP: (state, action) => {
    return {
      ...state,
      initialMap: action.index,
    }
  },
  CHANGE_GAME_NAME: (state, action) => {
    return {
      ...state,
      name: action.name,
    }
  },
  ADD_TERRAIN: (state, action) => {
    const {
      setIndex,
      tileIndex,
      terrainType,
    } = action;

    const {
      tilesets,
    } = state;

    const tileset = tilesets[setIndex];

    const terrains = Object.assign({}, tileset.terrains, { [tileIndex]: {
      type: terrainType,
    }});

    const newTileset = Object.assign({}, tileset, { terrains });
    const newTilesets = arrayReplace(state.tilesets, newTileset, setIndex);

    return Object.assign({}, state, { tilesets: newTilesets });
  },
  RECEIVE_TILESETS: (state, action) => {
    const tilesets = [...state.tilesets, ...action.tilesets];

    return Object.assign({}, state, { tilesets: tilesets });
  },
  CHANGE_TILESET_TYPE: (state, action) => {
    const {
      index,
      tilesetType: type,
    } = action;

    const tileset = state.tilesets[index];
    
    const newTileset = Object.assign({}, tileset, { type });
    const newTilesets = arrayReplace(state.tilesets, newTileset, index);

    return Object.assign({}, state, { tilesets: newTilesets });
  },
  CHANGE_TILESET_NAME: (state, action) => {
    const {
      index,
      name,
    } = action;

    const tileset = state.tilesets[index];
    
    const newTileset = Object.assign({}, tileset, { name });
    const newTilesets = arrayReplace(state.tilesets, newTileset, index);

    return Object.assign({}, state, { tilesets: newTilesets });
  },
  SAVE_FILENAME: (state, action) => {
    const {
      oldBasepath,
      newBasepath,
    } = action;

    if (!oldBasepath || !newBasepath) return state;

    const tilesets = state.tilesets.map(tileset => {
      const resolve = path.resolve(oldBasepath, tileset.src);
      const src = path.relative(newBasepath, resolve);

      return Object.assign({}, tileset, {
        src,
      });
    });

    return Object.assign({}, state, { tilesets: tilesets });
  },

  RECEIVE_SPRITE_SHEETS: (state, action) => {
    const sheets  = [...state.sheets, ...action.sheets];

    return Object.assign({}, state, { sheets });
  },

  LOAD_STAGE: (state, action) => {
    if (!action.app) return state;

    return { ...action.app };
  },
}, initialState);
