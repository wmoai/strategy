import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './views/App/App.jsx';

export default function({ store }) {
  window.onload = function() {
    render (
      <Provider store={store}>
        <App />
      </Provider>,
      document.querySelector('#contents')
    );

  };
}

