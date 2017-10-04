import React from 'react';
import { render } from 'react-dom';


const Player = require('../../../src/game/models/Player.js');

import Component from '../../../src/game/client/components/Selector/Selector.jsx';

class Container extends React.Component {
  render() {
    return (
      <Component
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
