import React from 'react';

import './style.css';

const MY_TURN = Symbol();
const ENEMY_TURN = Symbol();

export default class TurnCall extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      step: null,
      show: false,
      timer: null,
    };
  }

  componentDidMount() {
    this.update(this.props);
  }
  componentWillReceiveProps(props) {
    this.update(props);
  }

  update(props) {
    const { turn, isOffense } = props;
    // if (!game.isEnd) {
    if (turn == isOffense) {
      if (this.state.step != MY_TURN) {
        this.setState({
          show: true,
          step: MY_TURN
        }, this.setEnd);
      }
    } else if (this.state.step != ENEMY_TURN) {
      this.setState({
        show: true,
        step: ENEMY_TURN
      }, this.setEnd);
      this.props.onEndMyTurn();
    }
    // }
  }

  setEnd() {
    // setTimeout(() => {
      // this.setState({
        // show: false,
        // timer: null,
      // });
    // }, 1000);
  }

  render() {
    const { hidden, turn } = this.props;
    if (hidden || !this.state.show) {
      return null;
    }
    let body;

    switch (this.state.step) {
      case MY_TURN:
        body = (
          <div className="turncall-turn-text">YOUR TURN</div>
        );
        break;
      case ENEMY_TURN:
        body = (
          <div className="turncall-turn-text enemy">ENEMY TURN</div>
        );
        break;
    }

    return (
      <div id="turncall-base" key={turn}>
        {body}
      </div>
    );
  }

}

