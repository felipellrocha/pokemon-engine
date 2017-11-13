export function flood(x, y, replacementTile, prevTile, data, grid, visited = new Map()) {
  const index = XYToIndex(x, y, grid);
  const indexTile = data[index];

  if (x < 0 || x >= grid.columns || y < 0 || y >= grid.rows) return;
  if (!compareTiles(prevTile, indexTile)) return;

  data[index] = replacementTile;
  visited.set(index, 1);

  if (!visited.has(XYToIndex(x, y - 1, grid))) flood(x, y - 1, replacementTile, prevTile, data, grid, visited);
  if (!visited.has(XYToIndex(x + 1, y, grid))) flood(x + 1, y, replacementTile, prevTile, data, grid, visited);
  if (!visited.has(XYToIndex(x, y + 1, grid))) flood(x, y + 1, replacementTile, prevTile, data, grid, visited);
  if (!visited.has(XYToIndex(x - 1, y, grid))) flood(x - 1, y, replacementTile, prevTile, data, grid, visited);
}

export function areCoordinatesInside(x, y, grid) {
  return (x >= 0 && x < grid.columns && y >= 0 && y < grid.rows);
}

export function XYToIndex(x, y, grid) {
  return y * grid.columns + x;
}

export function IndexToXY(index, grid) {

  return [index % grid.columns, Math.floor(index / grid.columns)];
}

export function compareCoordinates(c1, c2, data, grid) {
  const t1 = data[XYToIndex(c1[0], c1[1], grid)]
  const t2 = data[XYToIndex(c2[0], c2[1], grid)]
  return compareTiles(t1, t2)
}

export function compareTiles(t1, t2) {
  return t1[0] === t2[0] && t1[1] === t2[1]
}

export function makeRect(c1, c2) {
  const x_min = Math.min(c1.x, c2.x);
  const y_min = Math.min(c1.y, c2.y);

  const x_max = Math.max(c1.x, c2.x);
  const y_max = Math.max(c1.y, c2.y);

  return {
    x: x_min,
    y: y_min,
    w: x_max - x_min,
    h: y_max - y_min,
  }
}
