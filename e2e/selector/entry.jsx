import React from 'react';
import { render } from 'react-dom';

import Component from '../../src/game/client/components/Selector/Selector.jsx';

class Container extends React.Component {
  render() {
    return (
      <Component
        costLimit={10}
        myDeck={[1,12,3,20,5,6]}
        isOffense={true}
        opponentsDeck={[4,5]}
      />
    );
  }
}

render(
  <Container />,
  document.getElementById('root')
);
