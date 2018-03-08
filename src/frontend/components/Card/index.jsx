import React from 'react';

import './style.css';
import UnitImage from '../UnitImage/index.jsx';

export default function Card({ data }) {
  return (
    <div className="card-container">
      <div className="name">
        <div className="cost">{data.cost}</div>
        <div className="body">{data.name}</div>
      </div>
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
              <td>{data.max_range == data.min_range ? data.min_range : `${data.min_range},${data.max_range}`}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

