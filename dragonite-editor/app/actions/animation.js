import electron from 'electron';
import { nativeImage } from 'electron';

export function selectSpriteSheets() {
  return (dispatch, getState) => {
    const sheets = electron.remote.dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        {name: 'Image Files', extensions: ['png', 'jpg']},
      ],
    })

    if (!sheets) return;

    dispatch(receiveSpriteSheets(sheets));
  }
}

export const RECEIVE_SPRITE_SHEETS = 'RECEIVE_SPRITE_SHEETS';

export function receiveSpriteSheets(sheets) {
  return {
    type: RECEIVE_SPRITE_SHEETS,
    sheets,
  }
}

export const ADD_ANIMATION = 'ADD_ANIMATION';

export function addAnimation(name) {
  return {
    type: ADD_ANIMATION,
    name,
  }
}

export const CHANGE_ANIMATION_FRAME_LENGTH = 'CHANGE_ANIMATION_FRAME_LENGTH';
export function changeAnimationFrameLength(index, numberOfFrames) {
  return {
    type: CHANGE_ANIMATION_FRAME_LENGTH,
    index,
    numberOfFrames,
  }
}

export const CHANGE_ANIMATION_NAME = 'CHANGE_ANIMATION_NAME';
export function changeAnimationName(index, name) {
  return {
    type: CHANGE_ANIMATION_NAME,
    index,
    name,
  }
}

export const CHANGE_ANIMATION_SPRITESHEET = 'CHANGE_ANIMATION_SPRITESHEET';
export function changeAnimationSpritesheet(index, sheet) {
  return {
    type: CHANGE_ANIMATION_SPRITESHEET,
    index,
    sheet,
  }
}

export const SELECT_ANIMATION = 'SELECT_ANIMATION';
export function selectAnimation(index) {
  return {
    type: SELECT_ANIMATION,
    index,
  }
}

export const SELECT_FRAME = 'SELECT_FRAME';
export function selectFrame(index) {
  return {
    type: SELECT_FRAME,
    index,
  }
}

export const DELETE_KEYFRAME = 'DELETE_KEYFRAME';

export function deleteKeyframe(selectedFrame) {
  return (dispatch, getState) => {
    const {
      global: {
        selectedAnimation,
      },
    } = getState();

    dispatch({
      type: DELETE_KEYFRAME,
      selectedAnimation,
      selectedFrame,
    });
  }
}

export const MOVE_SPRITE = 'MOVE_SPRITE';
export function moveSprite(coord) {
  return (dispatch, getState) => {
    const {
      global: {
        selectedAnimation,
        selectedFrame,
      },
    } = getState();

    dispatch({
      type: MOVE_SPRITE,
      selectedAnimation,
      selectedFrame,
      coord,
    });
  }
}

export const RESIZE_SPRITE = 'RESIZE_SPRITE';
export function resizeSprite(coord) {
  return (dispatch, getState) => {
    const {
      global: {
        selectedAnimation,
        selectedFrame,
      },
    } = getState();

    dispatch({
      type: RESIZE_SPRITE,
      selectedAnimation,
      selectedFrame,
      coord,
    });
  }
}
