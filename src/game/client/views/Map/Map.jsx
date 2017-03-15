import React from 'react';
import { connect } from 'react-redux';

import './Map.css';

const Map = ({map}) => {
  return (
    <div>
      <table id="field">
        <tbody>
          {map.field.rows().map((row, y) => {
            return (
              <tr key={y}>
                {row.map((geo, x) => {
                  let maskClasses = ['overlay'];
                  return (
                    <td
                      className={`geo_${geo}`}
                      key={x}
                      onClick={() => {}}
                      onMouseOver={() => {}}
                    >
                      <div className={maskClasses.join(' ')}></div>
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
};

export default connect(
  state => {
    return {
      map: state.map
    };
  }
)(Map);
