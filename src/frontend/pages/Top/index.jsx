import React from 'react';
import { Link } from 'react-router-dom';

import Deck from '../../components/Deck/index.jsx';

import './style.css';

export default class Top extends React.Component {

  componentDidMount() {
    this.props.onInit();
  }

  render() {
    const { deck, onClickCreateDeck } = this.props;
    return (
      <div id="top-base">
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
          <div id="top-deck">
            <h2>YOUR DECK</h2>
            <Deck deck={deck} />
          </div>
        </div>
      </div>
    );
  }

}
