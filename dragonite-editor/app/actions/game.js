export const CHANGE_GAME_NAME = 'CHANGE_GAME_NAME';

export function changeGameName(name) {
  return {
    type: CHANGE_GAME_NAME,
    name,
  }
}

export const CHANGE_INITIAL_MAP = 'CHANGE_INITIAL_MAP';

export function changeInitialMap(index) {
  return {
    type: CHANGE_INITIAL_MAP,
    index: parseInt(index),
  }
}

export const CHANGE_TILE_WIDTH = 'CHANGE_TILE_WIDTH';

export function changeTileWidth(value) {
  return {
    type: CHANGE_TILE_WIDTH,
    value: parseInt(value),
  }
}

export const CHANGE_TILE_HEIGHT = 'CHANGE_TILE_HEIGHT';

export function changeTileHeight(value) {
  return {
    type: CHANGE_TILE_HEIGHT,
    value: parseInt(value),
  }
}

export const CHANGE_GRID_COLUMNS = 'CHANGE_GRID_COLUMNS';

export function changeGridColumns(value) {
  return {
    type: CHANGE_GRID_COLUMNS,
    value: parseInt(value),
  }
}

export const CHANGE_GRID_ROWS = 'CHANGE_GRID_ROWS';

export function changeGridRows(value) {
  return {
    type: CHANGE_GRID_ROWS,
    value: parseInt(value),
  }
}
