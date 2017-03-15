import React from 'react';

import UnitSymbol from './UnitSymbol.jsx';
// import Result from './Result.jsx';

export default function Map({ dispatch, game, pnum, ui }) {
  const map = game.map;
  if (!map) {
    return (
      <div>ロード中</div>
    );
  }
  const units = game.map.units;
  const movable = ui.mask.movable || {};
  const actionable = ui.mask.actionable || {};

  return (
    <div>
      <table id="field">
        <tbody>
          {map.field.rows().map((row, y) => {
            return (
              <tr key={y}>
                {row.map((geo, x) => {
                  const cellId = map.field.cellId(y, x);
                  let maskClasses = ['overlay'];
                  if (movable[cellId] != undefined) {
                    maskClasses.push('movable');
                  } else if (actionable[cellId]) {
                    if (ui.forcusedUnit.klass().healer) {
                      maskClasses.push('healable');
                    } else {
                      maskClasses.push('attackable');
                    }
                  }
                  return (
                    <td
                      className={`geo_${geo}`}
                      key={x}
                      onClick={() => {dispatch('selectCell', cellId);}}
                      onMouseOver={() => {dispatch('hoverCell', cellId);}}
                    >
                      <div className={maskClasses.join(' ')}></div>
                      <UnitSymbol
                        unit={units[cellId]}
                        pnum={pnum} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );


    /*
    return (
      <div>
        <Result
          dispatch={this.dispatch}
          winner={this.state.winner}
          mypnum={pnum}
        />
        <Preparation
          dispatch={this.dispatch}
          show={this.state.prep.show}
          pnum={pnum}
          deck={this.state.client.deck}
          selected={this.state.prep.selected}
          cost={this.state.prep.cost}
          />
        <table id="field">
          <tbody>
            {map.field.rows().map((row, y) => {
              return (
                <tr key={y}>
                  {row.map((geo, x) => {
                    const cellId = map.field.cellId(y, x);
                    let maskClasses = ['overlay'];
                    if (movable[cellId] != undefined) {
                      maskClasses.push('movable');
                    } else if (actionable[cellId]) {
                      if (this.state.client.forcusedUnit.klass().healer) {
                        maskClasses.push('healable');
                      } else {
                        maskClasses.push('attackable');
                      }
                    }
                    return (
                      <td
                        className={`geo_${geo}`}
                        key={x}
                        onClick={() => {this.dispatch('selectCell', cellId);}}
                        onMouseOver={() => {this.dispatch('hoverCell', cellId);}}
                      >
                        <div className={maskClasses.join(' ')}></div>
                        <UnitSymbol
                          unit={units[cellId]}
                          pnum={pnum} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <Navigator
          dispatch={this.dispatch}
          refunit={info.unit}
          refbattle={info.battle}
          pnum={pnum}
          left={this.state.naviLeft}
        />
      </div>
    );
*/
}

