import {
  newGame,
  writeFile,
  openFile,
  openAnimations,
} from 'actions';

export default {
  'new': newGame,
  'save': () => writeFile(),
  'save-as': () => writeFile(true),
  'open': openFile,
  'textures-screen': () => () => {
    window.location.hash = '/import';
  },
  'entity-screen': () => () => { 
    window.location.hash = '/entity';
  },
  'tiling-screen': () => () => { 
    window.location.hash = '/selector';
  },
  'settings-screen': () => () => { 
    window.location.hash = '/settings';
  },
  'animations-screen': () => () => { 
    window.location.hash = '/animations';
  },
}
