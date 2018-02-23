// @flow
import React from 'react';

import './style.css';

type Props = {
  onReturnRoom: void => void,
}

export default function Disconnected({ onReturnRoom }: Props) {
  return (
    <div id="disconnected-container">
      <div className="message">対戦相手の接続が切れました</div>
      <button
        className="return"
        onClick={() => {
          onReturnRoom();
        }}>
        戻る
      </button>
    </div>
  );
}
