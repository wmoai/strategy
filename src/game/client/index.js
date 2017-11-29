import { init as initStore } from './store.js';
import { init as initSocket } from './websocket.js';
import { init as initFrontEnd } from './frontend.js';

require('../data').init();
import Renderer from './Renderer';

const store = initStore();
initSocket(store);

document.addEventListener('DOMContentLoaded', () => {
  Renderer.preload().then(() => {
    initFrontEnd(store);
  });
});

