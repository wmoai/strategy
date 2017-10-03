import React from 'react';
import { render } from 'react-dom';

import Component from '../Container.jsx';


render(
  <Component
    onJoinRoom={id => {
      console.log('jojoin', id);
    }}
  />,
  document.getElementById('root')
);

