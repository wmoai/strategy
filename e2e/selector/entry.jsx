import React from 'react';
import { render } from 'react-dom';

const data = require('../../src/game/data').init();
import Component from '../../src/game/client/components/Selector/Selector.jsx';

class Container extends React.Component {
  render() {
    return (
      <Component
        costLimit={10}
        myUnits={[1,12,3,20,5,6].map(id => data.unit[id])}
        isOffense={true}
        opponentUnits={[4,5].map(id => data.unit[id])}
      />
    );
  }
}

render(
  <Container />,
  document.getElementById('root')
);
