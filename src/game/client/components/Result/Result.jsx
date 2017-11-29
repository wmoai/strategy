import React from 'react';

import './Result.css';

export default class Result extends React.Component {

  render() {
    const { won, onReturnRoom } = this.props;

    return (
      <div id="result-container">
        <div id="result-head">
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

}
