// @flow
import React, { Fragment } from 'react';
import './style.css';

import UnitImage from '../UnitImage/index.jsx';

import type { UnitData } from '../../../game/data/unitData.js';

type Props = {
  costLimit: number,
  myUnits: Array<UnitData>,
  isOffense: boolean,
  opponentUnits: Array<UnitData>,
  onSubmit: Array<number> => void,
};
type State = {
  selected: Array<any>,
  isEmitted: boolean,
};

function Unit({ unit, isSelected=false, isOffense } : {
  unit: UnitData,
  isSelected?: boolean,
  isOffense: boolean,
}) {
  return (
    <Fragment>
      <div className="sel-unit-image">
        <UnitImage klassId={unit.klass} isOffense={isOffense} isGray={!isSelected} />
      </div>
      <div className="sel-unit-name">{unit.name}</div>
      <div className="sel-unit-cost">{unit.cost}</div>
    </Fragment>
  );
}

export default class Selector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selected: [],
      isEmitted: false,
    };
  }

  selectSortie(index: number) {
    const indexOf = this.state.selected.indexOf(index);
    if (indexOf >= 0) {
      this.setState({
        selected: this.state.selected.filter((sel, i) => {
          return i != indexOf;
        })
      });
    } else {
      this.setState({
        selected: this.state.selected.concat(index)
      });
    }
  }

  render() {
    const { myUnits, isOffense, opponentUnits, onSubmit } = this.props;
    const { costLimit } = this.props;
    const { selected } = this.state;

    let cost = 0;
    selected.forEach(i => {
      cost += myUnits[i].cost;
    });

    let costStyle = (cost < 1 || cost > costLimit) ? {
      color: 'red',
    } : null;
    const submittable = cost > 0 && cost <= costLimit;

    return (
      <div id="sel-base">
        <h2>出撃ユニット選択</h2>
        <div id="sel-container">
          <div className={'sel-player ' + (isOffense ? 'box-offense' : 'box-defense')}>
            <div className="sel-side">
              <div className="sel-army">自軍</div>
              <div className="sel-roll">{isOffense ? '攻撃' : '防衛'}</div>
            </div>
            <div className="sel-box">
              <ul className="sel-units-list">
                {myUnits.map((unit, i) => {
                  const isSelected = (selected.indexOf(i) >= 0);
                  return (
                    <li
                      key={i}
                      className={isSelected ? 'selected' : null}
                      onClick={() => {
                        if (this.state.isEmitted) {
                          return;
                        }
                        this.selectSortie(i);
                      }}>
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
                <div id="sel-currentcost" style={costStyle}>{cost}</div>
                <div id="sel-limitcost">/{costLimit}</div>
              </div>
              <button
                id="sel-submitter"
                disabled={!submittable || this.state.isEmitted}
                onClick={()=> {
                  if (cost > 0 && cost <= costLimit) {
                    onSubmit(selected);
                    this.setState({
                      isEmitted: true
                    });
                  }
                }}>
                出撃
              </button>
            </div>
          </div>
          <div className={'sel-player ' + (!isOffense ? 'box-offense' : 'box-defense')}>
            <div className="sel-side">
              <div className="sel-army">敵軍</div>
              <div className="sel-roll">{!isOffense ? '攻撃' : '防衛'}</div>
            </div>
            <div className="sel-box">
              <ul className="sel-units-list">
                {opponentUnits.map((unit, i) => {
                  return (
                    <li key={i}>
                      <Unit
                        unit={unit}
                        isOffense={isOffense}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

