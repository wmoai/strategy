import React from 'react';

import './style.css';

export default function Indicator({ shown }) {
  return (
    <img id="global-indicator" className={shown ? '' : 'hidden'} src="/image/indicator.gif" />
  );
}
