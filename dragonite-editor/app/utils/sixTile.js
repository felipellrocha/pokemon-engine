function southWestOffset(directions, terrain) {
  const {
    isNorth,
    isSouth,
    isWest,
    isEast,

    isSouthWest,
  } = directions;

  if (isSouth && isWest) {
    if (!isSouthWest) return [2, 1];
    else return [1, 4];
  }

  if (isSouth && !isWest) return [0, 4];
  if (!isSouth && isWest) return [1, 5];

  if (!isSouth && !isWest) return [0, 5];
}

function southEastOffset(directions, terrain) {
  const {
    isNorth,
    isSouth,
    isWest,
    isEast,

    isSouthEast,
  } = directions;

  if (isSouth && isEast) {
    if (!isSouthEast) return [3, 1];
    else return [2, 4];
  }

  if (isSouth && !isEast) return [3, 4];
  if (!isSouth && isEast) return [2, 5];

  if (!isSouth && !isEast) return [3, 5];
}

function northWestOffset(directions, terrain) {
  const {
    isNorth,
    isSouth,
    isWest,
    isEast,
    
    isNorthWest,
  } = directions;

  if (isNorth && isWest) {
    if (!isNorthWest) return [2, 0];
    else return [1, 3];
  }

  if (isNorth && !isWest) return [0, 3];
  if (!isNorth && isWest) return [1, 2];

  if (!isNorth && !isWest) return [0, 2];
}

function northEastOffset(directions, terrain) {
  const {
    isNorth,
    isSouth,
    isWest,
    isEast,

    isNorthEast,
  } = directions;

  if (isNorth && isEast) {
    if (!isNorthEast) return [3, 0];
    else return [2, 3];
  }

  if (isNorth && !isEast) return [3, 3];
  if (!isNorth && isEast) return [2, 2];

  if (!isNorth && !isEast) return [3, 2];
}

export default {
  northEastOffset,
  northWestOffset,
  southEastOffset,
  southWestOffset,
};
