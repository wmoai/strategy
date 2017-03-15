import React from 'react';

export default function Preparation({ dispatch, data, meta }) {
  if (!data.show) {
    return null;
  }
  const cost = data.cost;
  let costStyle = (cost > 20) ? {
    color: 'red',
    fontWeight: 'bold'
  } : null;
  const submittable = (cost > 0 && cost <= 20);
  let deck = meta.deck;
  const selected = data.selected;
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
                if (data.selected.indexOf(i) >= 0 || data.cost <= 20) {
                  dispatch('selectSortie', i, meta.deck.army[i].cost);
                }
              }}>
              {unit.name}
            </button>
          );
        })}
      </div>
      <div>
        <div>
          統率コスト：<span style={costStyle}>{data.cost}</span>/20
        </div>
      </div>
      <button disabled={!submittable} onClick={()=> {
        if (data.cost > 0 && data.cost <= 20) {
          dispatch('makeSortie');
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
