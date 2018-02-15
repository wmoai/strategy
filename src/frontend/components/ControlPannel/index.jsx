// @flow
import React, { Fragment } from 'react';
import './style.css';

import UnitImage from '../UnitImage/index.jsx';

import Unit from '../../../game/models/Unit.js';
import Terrain from '../../../game/models/Terrain.js';
import type { Forecast } from '../../../game/models/Game.js';

function TurnEndComponent({ isMyTurn, onClickEndTurn }) {
  return (
    <button
      id="cp-turnend-btn"
      disabled={!isMyTurn}
      onClick={() => onClickEndTurn()}
    >
      {isMyTurn ? (
        <span>ターン<br/>終了</span>
      ) : (
        <span>相手の<br/>ターン</span>
      )}
    </button>
  );
}

function UnitComponent({ unit }: { unit: ?Unit }) {
  if (!unit) {
    return null;
  }
  const status = unit.status;
  return (
    <div id="cp-unit" className={unit.isOffense ? 'offense' : 'defense'}>
      <div id="cp-unit-header">
        <div id="cp-unit-name">{status.name}</div>
        <div id="cp-unit-hp">
          <span>HP</span>
          <div id="cp-unit-hp-val">
            <span >{unit.state.hp}</span>
            <span className="max">/{status.hp}</span>
          </div>
        </div>
      </div>
      <div id="cp-unit-main">
        <div id="cp-unit-avatar">
          <UnitImage klassId={unit.klass.id} isOffense={unit.isOffense} />
        </div>
        <table id="cp-status-table">
          <tbody>
            <tr>
              <th>力</th>
              <td>{status.str}</td>
              <th>技</th>
              <td>{status.skl}</td>
            </tr>
            <tr>
              <th>守備</th>
              <td>{status.dff}</td>
              <th>移動</th>
              <td>{status.move}</td>
            </tr>
            <tr>
              <th>信仰</th>
              <td>{status.fth}</td>
              <th>射程</th>
              <td>
                {
                  status.min_range == status.max_range
                    ? status.min_range
                    : `${status.min_range}-${status.max_range}`
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
          <div id="cp-army">防衛軍</div>
        )}
        { turnRemained > 1 ? (
          <div id="cp-turn">残り<b>{turnRemained}</b>ターン</div>
        ) : (
          <div id="cp-turn"><b>最終ターン</b></div>
        )}
      </div>
      <div id="cp-terrain">
        {terrain &&
            <Fragment>
              <span className="name">{terrain.name}</span>
              <span className="avoid">回避</span>
              <span className="value">
                {terrain.avoidance > 0 ? `+${terrain.avoidance}` : terrain.avoidance}
              </span>
            </Fragment>
        }
      </div>
    </div>
  );
}

function percentStr(value: number) {
  return value ? `${value}%` : null;
}

function ForecastComponent({ forecast }) {
  const mySide = (forecast.me.isOffense == forecast.tg.isOffense)
    ? 'healer' : (forecast.me.isOffense ? 'offense' : 'defense');
  const opSide = forecast.tg.isOffense ? 'offense' : 'defense';

  const { me, tg } = forecast;

  return (
    <div id="cp-forecast">
      <div id="cp-forecast-wrap">
        <div className={['unit', mySide].join(' ')}>
          <div>
            <UnitImage klassId={me.klass} isOffense={me.isOffense} />
            <div className="name">{me.name}</div>
          </div>
        </div>
        <table>
          <tbody>
            <tr className={mySide}>
              <td className="important">{me.hp}</td>
              <td className="important">{me.val || '-'}</td>
              <td>{percentStr(me.hit) ||  '-'}</td>
              <td>{percentStr(me.crit) || '-'}</td>
            </tr>
            <tr>
              <th>HP</th>
              <th>威力</th>
              <th>命中</th>
              <th>会心</th>
            </tr>
            <tr className={opSide}>
              <td className="important">{tg.hp}</td>
              <td className="important">{tg.val || '-'}</td>
              <td>{percentStr(tg.hit) || '-'}</td>
              <td>{percentStr(tg.crit) || '-'}</td>
            </tr>
          </tbody>
        </table>
        <div className={['unit', opSide].join(' ')}>
          <div>
            <UnitImage klassId={tg.klass} isOffense={tg.isOffense} />
            <div className="name">{tg.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ControlPannel({ isOffense, terrain, unit, forecast, turnRemained, isMyTurn, onClickEndTurn }: {
  isOffense: boolean,
  terrain: ?Terrain,
  unit: ?Unit,
  forecast: ?Forecast,
  turnRemained: number,
  isMyTurn: boolean,
  onClickEndTurn: void => void,
}) {
  return (
    <div id="cp-container">
      <div id="cp-contents">
        <TurnEndComponent
          isMyTurn={isMyTurn}
          onClickEndTurn={onClickEndTurn}
        />
        {forecast ? (
          <ForecastComponent forecast={forecast} />
        ) : (
          <UnitComponent unit={unit} />
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
