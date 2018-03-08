import React from 'react';

import './style.css';

import Indicator from '../../components/Indicator/index.jsx';
import Card from '../../components/Card/index.jsx';

const deckLimit = 12;

export default class Top extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      deckBuffer: null,
    };
  }

  componentDidMount() {
    if (!this.props.deck) {
      this.props.onInit();
    } else {
      this.setState({ deckBuffer: this.props.deck });
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({ deckBuffer: newProps.deck });
  }

  removeCard(index) {
    this.setState({
      deckBuffer: this.state.deckBuffer.filter((unit, i) => index !== i)
    });
  }

  addCard(index) {
    const { deckBuffer } = this.state;
    if (!deckBuffer || deckBuffer.length >= deckLimit) {
      return;
    }
    this.setState({
      deckBuffer: this.state.deckBuffer.concat(this.props.unitsData[index]),
    });
  }

  render() {
    const { waiting, unitsData, onClickSaveDeck } = this.props;
    const { deckBuffer } = this.state;
    const deckCount = deckBuffer ? deckBuffer.length : 0;
    const isValidCount = deckCount === deckLimit;
    const isSubmittable = isValidCount && deckBuffer;
    return (
      <div id="deck-container">
        <Indicator shown={waiting} />
        <div id="my-deck">
          <div id="head">
            <h1>YOUR DECK</h1>
            <div id="counter">
              <span id="current" className={!isValidCount ? 'invalid' : null}>{deckCount}</span>
              <span>/{deckLimit}</span>
            </div>
            <button
              id="submitter"
              disabled={!isSubmittable}
              onClick={() => {
                onClickSaveDeck(deckBuffer.map(unit => unit.id));
              }}
            >SAVE</button>
          </div>
          <ul className="card-list">
            {deckBuffer && deckBuffer.map((unit, i) => {
              return (
                <li key={i}>
                  <button className="card-btn" onClick={() => this.removeCard(i)}>
                    <Card data={unit} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div id="pool">
          <ul className="card-list">
            {unitsData.map((unitData, i) => {
              return (
                <li key={i}>
                  <button className="card-btn" onClick={() => this.addCard(i)}>
                    <Card data={unitData} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

}
