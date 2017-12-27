import React from 'react';

import './style.css';

function Unit({ unit }) {
  if (!unit) {
    return null;
  }
  const status = unit.status;
  return (
    <div id="cp-unit" className={unit.isOffense ? 'offense' : 'defense'}>
      <div id="cp-unit-avatar">
        <div id="cp-unit-name">{status.name}</div>
        <div>
          <span>HP</span>
          <span id="hp">{unit.state.hp}</span>
          <span id="hp-max">/ {status.hp}</span>
        </div>
      </div>
      <table id="cp-status-table">
        <tbody>
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
                : `${status.min_range}-${status.max_range}`
            }</td>
        </tr>
      </tbody>
    </table>
  </div>
  );
}

function Info({ isOffense, terrain, turnRemained }) {
  return (
    <div id="cp-info">
      <div id="cp-banner" className={isOffense ? 'offense' : 'defense'}>
      {isOffense ? (
        <div id="cp-army">攻撃軍</div>
      ) : (
        <div id="cp-army">防御軍</div>
      )}
      <div id="cp-turn">残り{turnRemained}ターン</div>
    </div>
    <div id="cp-terrain">
      {terrain &&
          <React.Fragment>
            <span className="name">{terrain.name}</span>
            <span className="avoid">回避</span>
            <span className="value">
              {terrain.avoidance > 0 ? `+${terrain.avoidance}` : terrain.avoidance}
            </span>
          </React.Fragment>
      }
    </div>
    </div>
  );
}

function Forecast({ forecast }) {
  const mySide = (forecast.me.isOffense == forecast.tg.isOffense)
    ? 'healer' : (forecast.me.isOffense ? 'offense' : 'defense');
  const opSide = forecast.tg.isOffense ? 'offense' : 'defense';
  return (
    <div id="cp-forecast">
      <ul className={mySide}>
        <li>{forecast.me.name}</li>
        <li>{forecast.me.hp}</li>
        <li>{forecast.me.val || '-'}</li>
        <li>{forecast.me.hit || '-'}</li>
        <li>{forecast.me.crit || '-'}</li>
      </ul>
      <ul>
        <li></li>
        <li>HP</li>
        <li>威力</li>
        <li>命中</li>
        <li>必殺</li>
      </ul>
      <ul className={opSide}>
        <li>{forecast.tg.name}</li>
        <li>{forecast.tg.hp}</li>
        <li>{forecast.tg.val || '-'}</li>
        <li>{forecast.tg.hit || '-'}</li>
        <li>{forecast.tg.crit || '-'}</li>
      </ul>
    </div>
  );
}

export default function ControlPannel({ isOffense, terrain, unit, forecast, turnRemained }) {
  return (
    <div id="cp-container">
      <div id="cp-contents">
        {forecast ? (
          <Forecast forecast={forecast} />
        ) : (
          <Unit unit={unit} />
        )}
        <Info
          isOffense={isOffense}
          terrain={terrain}
          turnRemained={turnRemained}
        />
      </div>
    </div>
  );

}
