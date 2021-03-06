import React from 'react';
import {
  BrowserRouter,
  Route,
} from 'react-router-dom';

import Top from './containers/Top.js';
import Deck from './containers/Deck.js';
import Match from './containers/Match.js';

export default class Router extends React.Component {

  render() {
    return (
      <BrowserRouter>
        <div>
          <Route exact path="/" component={Top} />
          <Route path="/deck" component={Deck} />
          <Route path="/match" component={Match} />
        </div>
      </BrowserRouter>
    );
  }
}
