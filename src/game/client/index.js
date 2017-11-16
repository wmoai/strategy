import { init as initStore } from './store.js';
import { init as initSocket } from './websocket.js';
import { init as initFrontEnd } from './frontend.js';

require('../data').init();
import GraphicRenderer from './GraphicRenderer.js';

const store = initStore();
initSocket(store);

document.addEventListener('DOMContentLoaded', () => {
  GraphicRenderer.preload().then(() => {
    initFrontEnd(store);
  });
});

