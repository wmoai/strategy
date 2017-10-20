import React from 'react';

import './Result.css';

export default class Result extends React.Component {

  render() {
    const { isEnd, won, onReturnRoom } = this.props;
    if (!isEnd) {
      return null;
    }

    return (
      <div id="result-base">
        <div id="result-contents">
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
      </div>
    );
  }

}
