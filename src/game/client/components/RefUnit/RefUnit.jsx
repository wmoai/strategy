import React from 'react';
import './RefUnit.css';

export default function RefUnit({ unit }) {
  if (!unit) {
    return null;
  }
  const status = unit.status();
  return (
    <div id="refunit" className={unit.offense ? 'offense' : 'defense'}>
      <table id="refunit-table">
        <tbody>
          <tr>
            <td colSpan="4">{status.name}</td>
          </tr>
          <tr>
            <th>HP</th>
            <td colSpan="3">
              <span id="hp">{unit.hp}</span>
              <span id="hp-max">/ {status.hp}</span>
            </td>
          </tr>
          <tr>
            <th>力</th>
            <td>{status.pow}</td>
            <th>幸運</th>
            <td>{status.luc}</td>
          </tr>
          <tr>
            <th>守備</th>
            <td>{status.dff}</td>
            <th>命中</th>
            <td>{status.hit}</td>
          </tr>
          <tr>
            <th>信仰</th>
            <td>{status.fth}</td>
            <th>移動</th>
            <td>{status.move}</td>
          </tr>
          <tr>
            <th>技</th>
            <td>{status.skl}</td>
            <th>射程</th>
            <td>{
              status.min_range == status.max_range
                ? status.min_range
                : `${status.min_range}~${status.max_range}`
            }</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

}
