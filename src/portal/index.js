import React from 'react';
import { render } from 'react-dom';

fetch('/deck.json', {
  credentials: 'include'
}).then(res => {
  return res.json();
}).then(json => {
});

document.addEventListener('DOMContentLoaded', () => {
  render(
    <div>hoge</div>,
    document.getElementById('deck')
  );
});


