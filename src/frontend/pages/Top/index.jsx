import React from 'react';
import { Link } from 'react-router-dom';

import Indicator from '../../components/Indicator/index.jsx';
import Deck from '../../components/Deck/index.jsx';

import './style.css';

export default class Top extends React.Component {

  componentDidMount() {
    this.props.onInit();
  }

  render() {
    const { deck, onClickCreateDeck, waiting } = this.props;
    return (
      <div id="top-base">
        <Indicator shown={waiting} />
        <div id="top-container">
          <ul id="top-navigator">
            <li>
              <button className="top-btn" onClick={() => onClickCreateDeck() }>ランダムデッキ</button>
            </li>
            {deck && 
                <li>
                  <Link className="top-btn strong" to="match" target="sl_game">対戦ロビー</Link>
                </li>
            }
          </ul>
          {deck && deck.length > 0 &&
              <div id="top-deck">
                <h2>YOUR DECK</h2>
                <Deck deck={deck} />
              </div>
          }
        </div>
      </div>
    );
  }

}
