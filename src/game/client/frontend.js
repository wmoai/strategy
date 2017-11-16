import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/App.js';

export function init(store) {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('contents')
  );
}
