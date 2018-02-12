import { handleActions } from 'redux-actions';

import {
  EMPTY,
} from 'utils/constants';

import {
	UUID,
  arrayReplace,
  arrayMoveUp,
  arrayMoveDown,
  arrayRemove,
  flood,
} from 'utils';

import {
  ADD_LAYER,
  TOGGLE_LAYER_VISIBILITY,
  MOVE_LAYER_UP,
  MOVE_LAYER_DOWN,
  REMOVE_LAYER,
  CHANGE_LAYER_NAME,
  CHANGE_LAYER_TYPE,

  CHANGE_GRID_COLUMNS,
  CHANGE_GRID_ROWS,

  PUT_DOWN_OBJECT,
  PUT_DOWN_TILE,
  PAINT_TILE,

  LOAD_STAGE,
  SAVE_FILENAME,

} from 'actions';

import {
  IndexToXY,
  XYToIndex,
  areCoordinatesInside,
  makeRect,
} from 'utils';

import {
  addLast,
  updateIn,
  setIn,
} from 'timm';

export const initialState = {
  grid: {
    columns: 10,
    rows: 10,
  },
  layers: [ ],
};

const generateEmptyTilemap = () => [...Array(initialState.grid.rows * initialState.grid.columns)].map((_, i) => [EMPTY, 0]);

initialState.layers = ['background', 'middleground', 'foreground'].map(name => ({
  id: UUID(),
  type: 'tile',
  name: name,
  visible: true,
  data: generateEmptyTilemap(),
}));

export default handleActions({
  CHANGE_GRID_COLUMNS: (state, action) => {
    const newGrid = Object.assign({}, state.grid, { columns: action.value });

    const layers = (function() {
      if (action.value === state.grid.columns) return state.layers;
      else if (action.value > state.grid.columns) {
        const newColumns = [...Array(action.value - state.grid.columns)].map((_, i) => [EMPTY, 0]);
        const rows = [...Array(state.grid.rows)];

        return state.layers.map(layer => {
          if (layer.type === 'object') return layer;

          const newRows = rows.map((_, i) => {
            const start = i * state.grid.columns;
            const end = start + state.grid.columns;
            const row = layer.data.slice(start, end);

            return [...row, ...newColumns];
          }, []);

          return Object.assign({}, layer, { data: newRows.reduce((prev, curr) => prev.concat(curr), []) });
        });
      }
      else {
        return state.layers.map(layer => {
          if (layer.type === 'object') return layer;

          const rows = [...Array(state.grid.rows)];
          const newRows = rows.map((_, i) => {
            const start = i * state.grid.columns;
            const end = start + action.value;
            return layer.data.slice(start, end);
          }, []);

          return Object.assign({}, layer, { data: newRows.reduce((prev, curr) => prev.concat(curr), []) });
        });
      }
    })();

    return Object.assign({}, state, { grid: newGrid, layers: layers });
  },
  CHANGE_GRID_ROWS: (state, action) => {
    const newGrid = Object.assign({}, state.grid, { rows: action.value });

    const layers = (function() {
      if (action.value === state.grid.rows) return state.layers;
      else if (action.value > state.grid.rows) {
        return state.layers.map(layer => {
          if (layer.type === 'object') return layer;

          const newRows = [...Array((action.value - state.grid.rows) * state.grid.columns)].map((_, i) => [EMPTY, 0])
          const data = [...layer.data, ...newRows];
          return Object.assign({}, layer, { data });
        });
      }
      else {
        return state.layers.map(layer => {
          if (layer.type === 'object') return layer;

          const data = [...layer.data.slice(0, action.value * state.grid.columns)]
          return Object.assign({}, layer, { data });
        });
      }
    })();

    return Object.assign({}, state, { grid: newGrid, layers: layers });
  },
  ADD_LAYER: (state, action) => {
    const layer = {
			id: UUID(),
      type: 'tile',
      name: 'untitled',
      visible: true,
      data: [...Array(state.grid.rows * state.grid.columns)].map((_, i) => [EMPTY, 0]),
    };

    const layers = [...state.layers, layer];

    return Object.assign({}, state, { layers: layers });
  },

  CHANGE_LAYER_TYPE: (state, action) => {
    const layer = state.layers[action.layer];
    const newLayer = Object.assign({}, layer, {
      type: action.layerType,
      data: (action.layerType === 'object') ? [ ] : generateEmptyTilemap(),
    });
    const newLayers = arrayReplace(state.layers, newLayer, action.layer);

    return Object.assign({}, state, { layers: newLayers });
  },
  CHANGE_LAYER_NAME: (state, action) => {
    const layer = state.layers[action.layer];

    if (layer.name === action.value) return state;

    const newLayer = Object.assign({}, layer, { name: action.value });
    const newLayers = arrayReplace(state.layers, newLayer, action.layer);

    return Object.assign({}, state, { layers: newLayers });
  },
  TOGGLE_LAYER_VISIBILITY: (state, action) => {
    const layer = state.layers[action.layer];
    const newLayer = Object.assign({}, layer, { visible: !layer.visible });
    const newLayers = arrayReplace(state.layers, newLayer, action.layer);

    return Object.assign({}, state, { layers: newLayers });
  },
  REMOVE_LAYER: (state, action) => {
    const newLayers = arrayRemove(state.layers, action.layer);
    
    return Object.assign({}, state, { layers: newLayers });
  },

  PAINT_TILE: (state, action) => {
    const {
      tile: {
        x,
        y,
      },
      layer,
      selectedTile,
    } = action;

    const {
      layers,
      grid,
    } = state;

    const index = (grid.columns * y) + x;

    const currentLayer = layers[layer];
    const currentTile = currentLayer.data[index];

    const newData = [...currentLayer.data];
    flood(x, y, selectedTile, currentTile, newData, grid);

    const newLayer = Object.assign({}, currentLayer, { data: newData });
    const newLayers = arrayReplace(state.layers, newLayer, layer);

    return Object.assign({}, state, { layers: newLayers });
  },

  MOVE_LAYER_UP: (state, action) => {
    const newLayers = arrayMoveUp(state.layers, action.layer);

    return Object.assign({}, state, { layers: newLayers });
  },
  MOVE_LAYER_DOWN: (state, action) => {
    const newLayers = arrayMoveDown(state.layers, action.layer);

    return Object.assign({}, state, { layers: newLayers });
  },

  CHANGE_ENTITY_FOR_OBJECT: (state, action) => {
    const {
      selectedLayer,
      selectedObject,
      id,
    } = action;

    return setIn(state, ['layers', selectedLayer, 'data', selectedObject, 1, 'entity'], id);
  },
  CHANGE_OBJECT_DIMENSIONS: (state, action) => {
    const {
      selectedLayer,
      selectedObject,
      property,
      value,
    } = action;

    return setIn(state, ['layers', selectedLayer, 'data', selectedObject, 1, 'rect', property], value);
  },

  PUT_DOWN_OBJECT: (state, action) => {
    const {
      initial,
      end,
      selectedLayer,
    } = action;

    const {
      x, y, w, h,
    } = makeRect(initial, end);

    const layer = state.layers[selectedLayer];
    const id = UUID();

    const newObject = [
      -3, 
      {
        id,
        rect: { x, y, w, h },
        components: [],
        entity: '',
      }
    ];

    return updateIn(state, ['layers', selectedLayer, 'data'], prev => [...prev, newObject]);
  },
  PUT_DOWN_TILE: (state, action) => {
    const {
      tile: {
        x: x_click,
        y: y_click,
      },
      layer,
      tileset,
      selectedTile,
      selectedShape,
    } = action;

    const {
      layers,
      grid,
    } = state;

    const index = XYToIndex(x_click, y_click, grid);
    const currentLayer = layers[layer];
    const currentTile = currentLayer.data[index];

    // TODO: calculate future values. Only proceed if at least
    // one of the values is different
    if (
      selectedShape.columns === 1 &&
      selectedShape.rows === 1 &&
      currentTile[0] === selectedTile[0] &&
      currentTile[1] === selectedTile[1]
    ) { return state };

    // create a new entire state first for performance reasons
    const newState = {
      ...state,
      layers: [
        ...state.layers.slice(0, layer),
        {
          ...state.layers[layer],
          data: [
            ...state.layers[layer].data,
          ],
        },
        ...state.layers.slice(layer + 1, state.layers.length),
      ],
    };

    const count = selectedShape.columns * selectedShape.rows;

    const [x_s, y_s] = IndexToXY(selectedTile[1], tileset || grid);

    // if the tileset type is not a normal tile, then we need to handle
    // it a bit differently
    if (selectedTile[0] < 0) {
      const gridIndex = XYToIndex(x_click, y_click, grid);
      const tilesetIndex = XYToIndex(x_s, y_s, grid);
      newState.layers[layer].data[gridIndex] = selectedTile;

      return newState;
    }

    [...Array(count)].forEach((_, i) => {
      const [x_i, y_i] = IndexToXY(i, selectedShape);

      const x_g = x_click + x_i;
      const y_g = y_click + y_i;

      const x_t = x_s + x_i;
      const y_t = y_s + y_i;

      if (!areCoordinatesInside(x_g, y_g, grid)) return;

      const gridIndex = XYToIndex(x_g, y_g, grid);
      const tilesetIndex = XYToIndex(x_t, y_t, tileset);

      newState.layers[layer].data[gridIndex] = [
        selectedTile[0],
        tilesetIndex,
      ];
    });

    return newState;
  },
  LOAD_STAGE: (state, action) => {
    if (!action.tilemap) return initialState;

    // clean up integers
    action.tilemap.layers = action.tilemap.layers.map(layer => {
      const data = (layer.type === 'object') ?
        layer.data :
        layer.data.map(t => {
          const [set, tile] = t;

          const setIndex = parseInt(set);
          const tileIndex = parseInt(tile);
          
          if (set !== -2) return [setIndex, tileIndex];
          else return [setIndex, tile];
        });

        return Object.assign({}, layer, {
          data,
        });
    });
    // clean up integers

    return { ...action.tilemap };
  },
  SAVE_FILENAME: (state, action) => {
    // clean up integers
    const layers = state.layers.map(layer => {
      const data = (layer.type === 'object') ?
        layer.data :
        layer.data.map(t => {
          const [set, tile] = t;

          const setIndex = parseInt(set);
          const tileIndex = parseInt(tile);
          
          if (set !== -2) return [setIndex, tileIndex];
          else return [setIndex, tile];
        });

      return Object.assign({}, layer, {
        data,
      });
    });

    return Object.assign({}, state, { layers });
    // clean up integers
  }
}, initialState); 
