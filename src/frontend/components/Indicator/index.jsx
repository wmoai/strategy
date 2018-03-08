import React from 'react';

import './style.css';

export default function Indicator({ shown }) {
  return (
    <div id="indicator-container" className={shown ? '' : 'hidden'}>
      <img id="global-indicator" src="/image/indicator.gif" />
    </div>
  );
}
