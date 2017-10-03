import React from 'react';
import MicroContainer from 'react-micro-container';
import { render } from 'react-dom';


const Player = require('../../../src/game/models/Player.js');

import Component from '../../../src/game/client/screens/Preparation/Preparation.jsx';

class Container extends MicroContainer {
  render() {
    return (
      <Component
        dispatch={this.dispatch}
        costLimit={10}
        player={new Player({
          offense: true,
          deck: [1,12,3,20,5,6],
        })}
        opponent={new Player({
          offense: false,
          deck: [4,5],
        })}
      />
    );
  }
}

render(
  <Container />,
  document.getElementById('root')
);
