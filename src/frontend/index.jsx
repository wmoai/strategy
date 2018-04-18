import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducers';

import Router from './Router.jsx';
import Client from '../game/client/index.js';

import middleware from './middleware.js';

const store = createStore(
  reducer,
  applyMiddleware(thunkMiddleware, middleware)
);

const contents = document.getElementById('contents');
if (contents) {
  Client.preload().then(() => {
    render(
      <div>
        <style>{'body { margin:0;padding:0; }'}</style>
        <style>
          {'@import url("https://fonts.googleapis.com/css?family=Anton")'}
        </style>
        <Provider store={store}>
          <Router />
        </Provider>
      </div>,
      contents
    );
  });
}
