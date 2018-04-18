import React from 'react';
import { Link } from 'react-router-dom';

import Indicator from '../../components/Indicator/index.jsx';
import Card from '../../components/Card/index.jsx';

import './style.css';

export default class Top extends React.Component {
  componentDidMount() {
    this.props.onInit();
  }

  render() {
    const { deck, waiting } = this.props;
    return (
      <div id="top-base">
        <Indicator shown={waiting} />
        <div id="top-container">
          <ul id="top-navigator">
            <li>
              <Link className="top-btn" to="deck">
                デッキ構築
              </Link>
            </li>
            {deck && (
              <li>
                <Link className="top-btn strong" to="match" target="sl_game">
                  対戦ロビー
                </Link>
              </li>
            )}
          </ul>
          {deck &&
            deck.length > 0 && (
              <div id="top-deck">
                <h2>YOUR DECK</h2>
                <ul>
                  {deck.map((unit, i) => {
                    return (
                      <li key={i}>
                        <Card data={unit} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
        </div>
      </div>
    );
  }
}
