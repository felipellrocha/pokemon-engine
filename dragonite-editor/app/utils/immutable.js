export function arrayMoveUp(data, index) {
  return [
    ...data.slice(0, index - 1),
    data[index], 
    data[index - 1],
    ...data.slice(index + 1, data.length)
  ];
};

export function arrayMoveDown(data, index) {
  return [
    ...data.slice(0, index),
    data[index + 1], 
    data[index],
    ...data.slice(index + 2, data.length)
  ];
};

export function arrayReplace(data, value, index) {
  return [
    ...data.slice(0, index),
    value,
    ...data.slice(index + 1, data.length)
  ];
};

export function arrayRemove(data, index) {
  return [
    ...data.slice(0, index),
    ...data.slice(index + 1, data.length)
  ];
};
