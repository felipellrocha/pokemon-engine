export const tabCharacter = '    ';

export const Tokens = {
  EMPTY: 0,
  ENTITY: 1,
  COMPONENT: 2,
  OPEN: 3,
  CLOSE: 4,
  WHITESPACE: 5,
  EQUAL: 6,
  COMMA: 7,
  INT: 8,
  BOOL: 9,
  PROPERTY: 10,
  TEXTURE_SOURCE: 11,
  ANIMATION_TYPE: 12,
  AI: 13,
};

export const Errors = {
  COMPONENT_NOT_FOUND: 'COMPONENT_NOT_FOUND',
  MEMBER_OF_COMPONENT_NOT_FOUND: 'MEMBER_OF_COMPONENT_NOT_FOUND',
}

export const DisplayErrors = {
  [Errors.COMPONENT_NOT_FOUND]: true,
  [Errors.MEMBER_OF_COMPONENT_NOT_FOUND]: true,
}
