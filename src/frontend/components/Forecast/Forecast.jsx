import React from 'react';
import './Forecast.css';

export default function Forecast({ forecast }) {
  if (!forecast) {
    return null;
  }
  const mySide = (forecast.me.isOffense == forecast.tg.isOffense)
    ? 'healer' : (forecast.me.isOffense ? 'offense' : 'defense');
  const opSide = forecast.tg.isOffense ? 'offense' : 'defense';
  return (
    <div id="forecast">
      <table id="forecast-table">
        <tbody>
          <tr>
            <td colSpan="3" className={mySide}>{forecast.me.name}</td>
          </tr>
          <tr>
            <td className={mySide}>{forecast.me.hp}</td>
            <th>HP</th>
            <td className={opSide}>{forecast.tg.hp}</td>
          </tr>
          <tr>
            <td className={mySide}>{forecast.me.val || '-'}</td>
            <th>威力</th>
            <td className={opSide}>{forecast.tg.val || '-'}</td>
          </tr>
          <tr>
            <td className={mySide}>{forecast.me.hit || '-'}</td>
            <th>命中</th>
            <td className={opSide}>{forecast.tg.hit || '-'}</td>
          </tr>
          <tr>
            <td className={mySide}>{forecast.me.crit || '-'}</td>
            <th>必殺</th>
            <td className={opSide}>{forecast.tg.crit || '-'}</td>
          </tr>
          <tr>
            <td colSpan="3" className={opSide}>{forecast.tg.name}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

}
