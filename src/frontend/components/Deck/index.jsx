import React from 'react';

import './style.css';
import UnitImage from '../UnitImage/index.jsx';

function Unit({ data }) {
  return (
    <div className="deck-unit">
      <div className="name">{data.name}</div>
      <div className="main">
        <div className="image">
          <UnitImage klassId={data.klass} isOffense={false} isGray={true} />
        </div>
        <table className="status-table">
          <tbody>
            <tr>
              <th>力</th>
              <td>{data.str}</td>
              <th>技</th>
              <td>{data.skl}</td>
            </tr>
            <tr>
              <th>守</th>
              <td>{data.dff}</td>
              <th>移</th>
              <td>{data.move}</td>
            </tr>
            <tr>
              <th>信</th>
              <td>{data.fth}</td>
              <th>射</th>
              <td>{data.max_range}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Deck({ deck }) {
  if (!deck) {
    return null;
  }

  return (
    <div id="deck-container">
      {deck.map((unit, i) => {
        return (
          <Unit data={unit} key={i} />
        );
      })}
    </div>
  );
}
