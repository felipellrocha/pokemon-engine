import { ipcRenderer as ipc } from 'electron';

export function IPCMiddleware(events = {}) {
  return store => {
    Object.keys(events).forEach(key => {
      ipc.on(key, () => {
        store.dispatch(events[key](...arguments));
      });
    });

    return next => action => next(action);
  }
};
