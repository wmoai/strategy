// @flow
import React from 'react';
import './Selector.css';

import UnitMaster from '../../../data/json/unit.json';

type Props = {
  costLimit: number,
  myDeck: Array<number>,
  isOffense: boolean,
  opponentsDeck: Array<number>,
  onSubmit: Array<number> => void,
};
type State = {
  selected: Array<any>,
  isEmitted: boolean,
};

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
    const { myDeck, isOffense, opponentsDeck, onSubmit } = this.props;
    let { costLimit } = this.props;
    if (isOffense === false) {
      costLimit += 2;
    }
    const { selected } = this.state;

    const army = myDeck.map(id => UnitMaster[id]);
    const enemy = opponentsDeck.map(id => UnitMaster[id]);

    let cost = 0;
    selected.forEach(i => {
      cost += army[i].cost;
    });

    let costStyle = (cost > costLimit) ? {
      color: 'red',
      fontWeight: 'bold'
    } : null;
    const submittable = cost > 0 && cost <= costLimit;

    return (
      <div id="sel-base">
        <h2>出撃ユニット選択</h2>
        <div id="sel-container">
          <div className="sel-row">
            <div className="sel-side">自軍</div>
            <div className={'sel-box ' + (isOffense ? 'box-offense' : 'box-defense')}>
              <div className="sel-roll">{isOffense ? '攻撃' : '防衛'}</div>
              <ul className="sel-units-list">
                {army.map((unit, i) => {
                  const isSelected = (selected.indexOf(i) >= 0);
                  const imageName = `${unit.klass}_${!isSelected ? 0 : isOffense ? 1 : 2}`;
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
                      <img src={`/image/units/${imageName}.png`} />
                      <div className="sel-unit-name">{unit.name}</div>
                      <div className="sel-unit-cost">{unit.cost}</div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="sel-footer">
              <div id="sel-totalcost">
                コスト：<span style={costStyle}>{cost}</span>/{costLimit}
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
          <div className="sel-row">
            <div className="sel-side">敵軍</div>
            <div className={'sel-box ' + (!isOffense ? 'box-offense' : 'box-defense')}>
              <div className="sel-roll">{!isOffense ? '攻撃' : '防衛'}</div>
              <ul className="sel-units-list">
                {enemy.map((unit, i) => {
                  return (
                    <li key={i}>
                      <img src={`/image/units/${unit.klass}_0.png`} />
                      <div className="sel-unit-name">{unit.name}</div>
                      <div className="sel-unit-cost">{unit.cost}</div>
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

