import React from 'react';
import { render } from 'react-dom';

const Map = require('../../../../../src/game/Map2.js');
import MapComponent from '../../../../../src/game/client/components/Map/Map.jsx';

render(
  <MapComponent
    map={new Map()}
  />,
  document.getElementById('root')
);
