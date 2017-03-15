import React from 'react';

export default function Preparation(props) {
  if (!props.show) {
    return null;
  }
  const cost = props.cost;
  let costStyle = (cost > 20) ? {
    color: 'red',
    fontWeight: 'bold'
  } : null;
  const submittable = (cost > 0 && cost <= 20);
  let deck = props.deck;
  const selected = props.selected;
  return (
    <div id="preparation">
      <div>出撃ユニット選択</div>
      <div className="units">
        {deck.army.map((unit, i) => {
          const c = ['unit'];
          if (selected.indexOf(i) >= 0) {
            c.push('selected');
          }
          return (
            <button
              className={c.join(' ')}
              key={i}
              onClick={() => {
                if (props.selected.indexOf(i) >= 0 || props.cost <= 20) {
                  props.dispatch('selectSortie', i, props.deck.army[i].cost);
                }
              }}>
              {unit.name}
            </button>
          );
        })}
      </div>
      <div>
        <div>
          統率コスト：<span style={costStyle}>{props.cost}</span>/20
        </div>
      </div>
      <button disabled={!submittable} onClick={()=> {
        if (props.cost > 0 && props.cost <= 20) {
          props.dispatch('makeSortie');
        }
      }}>出撃</button>
    <div>敵軍</div>
    <div className="units">
      {deck.enemy.map((unit, i) => {
        return (
          <button
            className="unit"
            key={i}>
            {unit.name}
          </button>
        );
      })}
    </div>

  </div>
  );
}
