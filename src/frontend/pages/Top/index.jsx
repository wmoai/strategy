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
          <div id="top-navigator">
            <button onClick={() => onClickCreateDeck() }>デッキ生成</button>
            <Link to="match">対戦ロビー</Link>
            <Deck deck={deck} />
          </div>
        </div>
      </div>
    );
  }

}
