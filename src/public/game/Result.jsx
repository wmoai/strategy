const React = require('react');

module.exports = class Result extends React.Component {
  render() {
    if (this.props.winner === undefined) {
      return null;
    }
    let message = '勝利';
    if (this.props.winner != this.props.mypnum) {
      message = '敗北';
    }
    return (
      <div>
        <span>{message}</span>
        <button onClick={() => this.props.dispatch('returnPortal')}>
          OK
        </button>
      </div>
    );
  }
};
