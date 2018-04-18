// @flow
import React from 'react';
import './style.css';

import Game from '../../../game/models/Game.js';

type Props = {
  isOffense: boolean,
  game: Game,
  onEnd: void => void
};

function Attack() {
  return (
    <div className="intro-box">
      <div className="intro-box-head">攻撃軍</div>
      <div>敵拠点を占領せよ</div>
    </div>
  );
}

function Defence() {
  return (
    <div className="intro-box">
      <div className="intro-box-head">防衛軍</div>
      <div>自軍拠点を防衛せよ</div>
    </div>
  );
}

export default function Intro({ isOffense, onEnd }: Props) {
  setTimeout(() => {
    onEnd();
  }, 3000);
  return (
    <div id="intro-base" onClick={() => onEnd()}>
      {isOffense ? <Attack /> : <Defence />}
    </div>
  );
}
