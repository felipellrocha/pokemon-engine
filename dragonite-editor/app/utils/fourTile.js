function southWestOffset(directions, terrain) {
  const {
    isNorth,
    isSouth,
    isWest,
    isEast,

    isSouthWest,
  } = directions;

  if (isSouth && isWest) return [1, 2];

  if (isSouth && !isWest) return [0, 2];
  if (!isSouth && isWest) return [1, 3];

  if (!isSouth && !isWest) return [0, 3];
}

function southEastOffset(directions, terrain) {
  const {
    isNorth,
    isSouth,
    isWest,
    isEast,

    isSouthEast,
  } = directions;

  if (isSouth && isEast) return [2, 2];

  if (isSouth && !isEast) return [3, 2];
  if (!isSouth && isEast) return [2, 3];

  if (!isSouth && !isEast) return [3, 3];
}

function northWestOffset(directions, terrain) {
  const {
    isNorth,
    isSouth,
    isWest,
    isEast,
    
    isNorthWest,
  } = directions;

  if (isNorth && isWest) return [1, 1];

  if (isNorth && !isWest) return [0, 1];
  if (!isNorth && isWest) return [1, 0];

  if (!isNorth && !isWest) return [0, 0];
}

function northEastOffset(directions, terrain) {
  const {
    isNorth,
    isSouth,
    isWest,
    isEast,

    isNorthEast,
  } = directions;

  if (isNorth && isEast) return [2, 1];

  if (isNorth && !isEast) return [3, 1];
  if (!isNorth && isEast) return [2, 0];

  if (!isNorth && !isEast) return [3, 0];
}

export default {
  northEastOffset,
  northWestOffset,
  southEastOffset,
  southWestOffset,
};
