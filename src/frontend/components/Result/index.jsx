// @flow
import React from 'react';

import './style.css';

type Props = {
  won: boolean,
  onReturnRoom: void => void,
}

export default function Result({ won, onReturnRoom }: Props) {
  if (won == null) {
    return null;
  }
  return (
    <div id="result-container">
      <div id="result-head" className={won ? 'win' : 'lose'}>
        {won ? '勝利' : '敗北'}
      </div>
      <button
        id="result-return"
        onClick={() => {
          onReturnRoom();
        }}>
        戻る
      </button>
    </div>
  );
}
