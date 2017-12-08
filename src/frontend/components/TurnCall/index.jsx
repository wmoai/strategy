import React from 'react';
import { Map } from 'immutable';

import './style.css';

const Step = Map({
  MY_TURN: Symbol(),
  ENEMY_TURN: Symbol(),
});

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
    const { game, isOffense } = props;
    if (!game.isEnd) {
      if (game.turn == isOffense) {
        if (this.state.step != Step.get('MY_TURN')) {
          this.setState({
            show: true,
            step: Step.get('MY_TURN')
          }, this.setEnd);
        }
      } else if (this.state.step != Step.get('ENEMY_TURN')) {
        this.setState({
          show: true,
          step: Step.get('ENEMY_TURN')
        }, this.setEnd);
        this.props.onEndMyTurn();
      }
    }
  }

  setEnd() {
    setTimeout(() => {
      this.setState({
        show: false,
        timer: null,
      });
    }, 1000);
  }

  render() {
    const { game, hidden } = this.props;
    if (hidden || !this.state.show || game.isEnd) {
      return null;
    }
    let body;

    switch (this.state.step) {
      case Step.get('MY_TURN'):
        body = (
          <div className="turncall-turn-text">YOUR TURN</div>
        );
        break;
      case Step.get('ENEMY_TURN'):
        body = (
          <div className="turncall-turn-text enemy">ENEMY TURN</div>
        );
        break;
    }

    return (
      <div id="turncall-base" key={game.turnCount}>
        {body}
      </div>
    );
  }

}

