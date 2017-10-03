import React from 'react';

import './Result.css';

export default class Result extends React.Component {

  render() {
    const { won } = this.props;
    if (won == undefined) {
      return null;
    }

    return (
      <div id="result-container">
        <div id="result-contents">
          {won ? '勝利' : '敗北'}
        </div>
      </div>
    );
  }

}
