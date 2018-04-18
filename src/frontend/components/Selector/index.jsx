// @flow
import React, { Fragment } from 'react';
import './style.css';

import UnitImage from '../UnitImage/index.jsx';

import type { UnitData } from '../../../game/data/unitData.js';

type Deck = {
  isOffense: boolean,
  units: Array<UnitData>
};

type Props = {
  costLimit: number,
  isOffense: boolean,
  myDeck: Deck,
  otherDecks: Array<Deck>,
  selected: Array<number>,
  isEmitted: boolean,
  onSelectUnit: number => void,
  onSubmit: (Array<number>) => void
};

function Unit({
  unit,
  isSelected = false,
  isOffense
}: {
  unit: UnitData,
  isSelected?: boolean,
  isOffense: boolean
}) {
  return (
    <Fragment>
      <UnitImage
        klassId={unit.klass}
        isOffense={isOffense}
        isGray={!isSelected}
      />
      <div className="sel-unit-name">{unit.name}</div>
      <div className="sel-unit-cost">{unit.cost}</div>
    </Fragment>
  );
}

export default function Selector({
  isOffense,
  myDeck,
  otherDecks,
  onSelectUnit,
  onSubmit,
  costLimit,
  selected,
  isEmitted
}: Props) {
  let cost = 0;
  selected.forEach(i => {
    cost += myDeck.units[i].cost;
  });

  let costStyle =
    cost < 1 || cost > costLimit
      ? {
        color: 'red'
      }
      : null;
  const submittable = cost > 0 && cost <= costLimit;

  return (
    <div id="sel-base">
      <h2>出撃ユニット選択</h2>
      <div id="sel-container">
        {myDeck && (
          <div
            className={
              'sel-player ' + (isOffense ? 'box-offense' : 'box-defense')
            }
          >
            <div className="sel-side">
              <div className="sel-army">自軍</div>
              <div className="sel-roll">{isOffense ? '攻撃' : '防衛'}</div>
            </div>
            <div className="sel-box">
              <ul className="sel-units-list">
                {myDeck.units.map((unit, i) => {
                  const isSelected = selected.indexOf(i) >= 0;
                  return (
                    <li
                      key={i}
                      className={isSelected ? 'selected' : null}
                      onClick={() => {
                        if (isEmitted) {
                          return;
                        }
                        onSelectUnit(i);
                      }}
                    >
                      <Unit
                        unit={unit}
                        isSelected={isSelected}
                        isOffense={isOffense}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="sel-foot">
              <div id="sel-totalcost">
                <div>コスト</div>
                <div id="sel-currentcost" style={costStyle}>
                  {cost}
                </div>
                <div id="sel-limitcost">/{costLimit}</div>
              </div>
              <button
                id="sel-submitter"
                disabled={!submittable || isEmitted}
                onClick={() => {
                  if (cost > 0 && cost <= costLimit) {
                    onSubmit(selected);
                  }
                }}
              >
                出撃
              </button>
            </div>
          </div>
        )}
        {otherDecks.map((deck, i) => {
          return (
            <div
              className={
                'sel-player ' + (deck.isOffense ? 'box-offense' : 'box-defense')
              }
              key={i}
            >
              <div className="sel-side">
                <div className="sel-army">敵軍</div>
                <div className="sel-roll">
                  {deck.isOffense ? '攻撃' : '防衛'}
                </div>
              </div>
              <div className="sel-box">
                <ul className="sel-units-list">
                  {deck.units.map((unit, i) => {
                    return (
                      <li key={i}>
                        <Unit unit={unit} isOffense={deck.isOffense} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
