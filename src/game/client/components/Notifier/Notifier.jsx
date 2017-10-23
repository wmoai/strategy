import React from 'react';
import { Map } from 'immutable';

import './Notifier.css';

const Step = Map({
  MY_TURN: Symbol(),
  ENEMY_TURN: Symbol(),
});

export default class Notifier extends React.Component {

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
    if (!this.state.show) {
      return null;
    }
    const { game } = this.props;
    let body;

    switch (this.state.step) {
      case Step.get('MY_TURN'):
        body = (
          <div className="notify-turn-text">YOUR TURN</div>
        );
        break;
      case Step.get('ENEMY_TURN'):
        body = (
          <div className="notify-turn-text enemy">ENEMY TURN</div>
        );
        break;
    }

    return (
      <div id="notify-base" key={game.turnCount}>
        {body}
      </div>
    );
  }

}

