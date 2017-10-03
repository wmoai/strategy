import React from 'react';
import './Preparation.css';

import UnitMaster from '../../../data/json/unit.json';

export default class Preparation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: [],
      isEmitted: false,
      unitsTexture: null,
    };
  }

  selectSortie(index) {
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
    const {
      dispatch,
      player,
      opponent,
    } = this.props;
    if (!player || !opponent) {
      return null;
    }
    let { costLimit=1 } = this.props;
    if (player.offense == false) {
      costLimit += 2;
    }
    const { selected } = this.state;

    const army = player.deck.map(id => UnitMaster[id]);
    const enemy = opponent.deck.map(id => UnitMaster[id]);

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
      <div id="prep-base">
        <h2>出撃ユニット選択</h2>
        <div id="prep-container">
          <section>
            <div className="prep-side">自軍</div>
            <div className={'prep-box ' + (player.offense ? 'box-offense' : 'box-defense')}>
              <div className="prep-roll">{player.offense ? '攻撃' : '防衛'}</div>
              <ul className="prep-units-list">
                {army.map((unit, i) => {
                  const isSelected = (selected.indexOf(i) >= 0);
                  const imageName = `${unit.klass}_${!isSelected ? 0 : player.offense ? 1 : 2}`;
                  return (
                    <li
                      key={i}
                      className={isSelected ? 'selected' : null}
                      onClick={() => {
                        if (this.state.isEmitted) {
                          return;
                        }
                        this.selectSortie(i, army[i].cost);
                      }}>
                      <img src={`/image/units/${imageName}.png`} />
                      <div className="prep-unit-name">{unit.name}</div>
                      <div className="prep-unit-cost">{unit.cost}</div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="prep-submitter">
              <span>
                統率コスト：<span style={costStyle}>{cost}</span>/{costLimit}
              </span>
              {!this.state.isEmitted &&
                  <button
                    disabled={!submittable}
                    onClick={()=> {
                      if (cost > 0 && cost <= costLimit) {
                        dispatch('electArmy', selected);
                        this.setState({
                          isEmitted: true
                        });
                      }
                    }}>
                    出撃
                  </button>
              }
            </div>
          </section>
          <section>
            <div className="prep-side">敵軍</div>
            <div className={'prep-box ' + (opponent.offense ? 'box-offense' : 'box-defense')}>
              <div className="prep-roll">{opponent.offense ? '攻撃' : '防衛'}</div>
              <ul className="prep-units-list">
                {enemy.map((unit, i) => {
                  return (
                    <li key={i}>
                      <img src={`/image/units/${unit.klass}_0.png`} />
                      <div className="prep-unit-name">{unit.name}</div>
                      <div className="prep-unit-cost">{unit.cost}</div>
                    </li>
                  );
                })}
              </ul>
            </div>

          </section>
        </div>
      </div>
    );
  }
}

