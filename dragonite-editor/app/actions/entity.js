export const ADD_ENTITY = 'ADD_ENTITY';

export function addEntity() {
  return {
    type: ADD_ENTITY,
  }
}

export const CHANGE_ENTITY_NAME = 'CHANGE_ENTITY_NAME';
export function changeEntityName(id, name) {
  return {
    type: CHANGE_ENTITY_NAME,
    id,
    name,
  }
}

export const RECEIVE_COMPONENT = 'RECEIVE_COMPONENT';
export function receiveComponent(id, component) {
  return {
    type: RECEIVE_COMPONENT,
    id,
    component,
  }
}

export const CHANGE_COMPONENT_VALUE = 'CHANGE_COMPONENT_VALUE';
export function changeComponentValue(id, componentIndex, memberIndex, value) {
  return {
    type: CHANGE_COMPONENT_VALUE,
    id,
    componentIndex,
    memberIndex,
    value,
  }
}

export const REMOVE_COMPONENT = 'REMOVE_COMPONENT';
export function removeComponent(id, componentIndex) {
  return {
    type: REMOVE_COMPONENT,
    id,
    componentIndex,
  }
}
