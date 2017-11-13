import electron from 'electron';
import {
  IndexToXY,
  XYToIndex,
} from 'utils';

export function viewTilesetEditor(history) {
  return dispatch => {
    history.push('/import');
  }
}

export const CHANGE_LAYER_TYPE = 'CHANGE_LAYER_TYPE';
export function changeLayerType(layer, layerType) {
  return {
    type: CHANGE_LAYER_TYPE,
    layer,
    layerType,
  }
}

export const TOGGLE_HIDE_GRID = 'TOGGLE_HIDE_GRID';
export function toggleHideGrid() {
  return {
    type: TOGGLE_HIDE_GRID,
  }
}

export const CHANGE_TERRAIN = 'CHANGE_TERRAIN';

export function changeTerrain(terrainType) {
  return {
    type: CHANGE_TERRAIN,
    terrainType,
  }
}

export const ADD_TERRAIN = 'ADD_TERRAIN';

export function addTerrain(setIndex, tileIndex, terrainType) {
  return {
    type: ADD_TERRAIN,
    setIndex,
    tileIndex,
    terrainType,
  }
}

export const CHANGE_ZOOM = 'CHANGE_ZOOM';

export function changeZoom(zoom) {
  return {
    type: CHANGE_ZOOM,
    zoom,
  }
}

export const MOVE_LAYER_UP = 'MOVE_LAYER_UP';

export function moveLayerUp(layer) {
  return {
    type: MOVE_LAYER_UP,
    layer,
  }
}

export const MOVE_LAYER_DOWN = 'MOVE_LAYER_DOWN';

export function moveLayerDown(layer) {
  return {
    type: MOVE_LAYER_DOWN,
    layer,
  }
}

export const ADD_LAYER = 'ADD_LAYER';

export function addLayer() {
  return {
    type: ADD_LAYER,
  }
}

export const CHANGE_LAYER_NAME = 'CHANGE_LAYER_NAME';

export function changeLayerName(layer, value) {
  return {
    type: CHANGE_LAYER_NAME,
    layer,
    value,
  }
}

export const TOGGLE_LAYER_VISIBILITY = 'TOGGLE_LAYER_VISIBILITY';

export function toggleLayerVisibility(layer) {
  return {
    type: TOGGLE_LAYER_VISIBILITY,
    layer,
  }
}

export const REMOVE_LAYER = 'REMOVE_LAYER';

export function removeLayer(layer) {
  return {
    type: REMOVE_LAYER,
    layer,
  }
}

export const SELECT_LAYER = 'SELECT_LAYER';

export function selectLayer(layer) {
  return {
    type: SELECT_LAYER,
    layer,
  }
}

export const SELECT_TILE = 'SELECT_TILE';

export function selectTile(tile) {
  return {
    type: SELECT_TILE,
    tile: [tile.setIndex, tile.tileIndex],
  }
}

export const SELECT_OBJECT = 'SELECT_OBJECT';

export function selectObject(id) {
  return {
    type: SELECT_OBJECT,
    id,
  }
}

export const CHANGE_ENTITY_FOR_OBJECT = 'CHANGE_ENTITY_FOR_OBJECT';
export function changeEntityForObject(id) {
  return (dispatch, getState) => {
    const {
      global: {
        selectedObject,
        selectedLayer,
      }
    } = getState();
    
    dispatch({
      type: CHANGE_ENTITY_FOR_OBJECT,
      selectedObject,
      selectedLayer,
      id,
    })
  }
}

export const SELECT_SHAPE = 'SELECT_SHAPE';

export function selectShape(columns, rows) {
  return {
    type: SELECT_SHAPE,
    columns,
    rows,
  }
}

export const PAINT_TILE = 'PAINT_TILE';

export function paintTile(tile) {
  return (dispatch, getState) => {
    const {
      global: {
        selectedLayer,
        selectedTile,
      },
    } = getState();

    dispatch({
      type: PAINT_TILE,
      tile,
      layer: selectedLayer,
      selectedTile,
    })
  }
}

export const PUT_DOWN_OBJECT = 'PUT_DOWN_OBJECT';

export function putDownObject(initial, end) {
  return (dispatch, getState) => {
    const {
      global: {
        selectedLayer,
      },
    } = getState();

    dispatch({
      type: PUT_DOWN_OBJECT,
      initial,
      end,
      selectedLayer,
    });
  }
}

export const PUT_DOWN_TILE = 'PUT_DOWN_TILE';

export function putDownTile(coordinates) {
  return (dispatch, getState) => {
    const {
      app: {
        tilesets,
      },
      global: {
        selectedLayer,
        selectedTile,
        selectedShape,
      },
    } = getState();

    dispatch({
      type: PUT_DOWN_TILE,
      tile: coordinates,
      layer: selectedLayer,
      tileset: tilesets[selectedTile[0]],
      selectedTile,
      selectedShape,
    })
  }
}

export const CHANGE_TILESET_TYPE = 'CHANGE_TILESET_TYPE'

export function changeTilesetType(index, tilesetType) {
  return {
    type: CHANGE_TILESET_TYPE,
    index,
    tilesetType,
  }
}

export const CHANGE_TILESET_NAME = 'CHANGE_TILESET_NAME'

export function changeTilesetName(index, name) {
  return {
    type: CHANGE_TILESET_NAME,
    index,
    name,
  }
}

export const CHANGE_TILING_METHOD = 'CHANGE_TILING_METHOD'

export function changeTilingMethod(method) {
  return {
    type: CHANGE_TILING_METHOD,
    method,
  }
}

export const CHANGE_INITIAL_TILE = 'CHANGE_INITIAL_TILE';
export function changeInitialTile(initialTileIndex) {
  return {
    type: CHANGE_INITIAL_TILE,
    initialTileIndex,
  }
}

export function receiveTileSelection(currentTileIndex, setIndex, grid, initialTileIndex) {
  return (dispatch, getState) => {
    if (initialTileIndex) dispatch(changeInitialTile(initialTileIndex));

    const {
      global: {
        initialTileIndex: initial,
      },
    } = getState();

    const [x1, y1] = IndexToXY(initial, grid);
    const [x2, y2] = IndexToXY(currentTileIndex, grid);

    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const w = Math.abs(x1 - x2);
    const h = Math.abs(y1 - y2);

    const tileIndex = XYToIndex(x, y, grid);

    dispatch(selectTile({
      setIndex,
      tileIndex,
    }));
    dispatch(selectShape(w + 1, h + 1));
  }
}
