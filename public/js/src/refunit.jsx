import React from 'react';

export default class Container extends React.Component {
  render() {
    let unit = this.props.unit;
    if (!unit) {
      return <div></div>;
    }
    return (
      <table className="refunit">
        <thead>
          <tr>
            <th></th>
            <th>HP</th>
            <th>攻</th>
            <th>守</th>
            <th>精</th>
            <th>移</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>{unit[3]}</th>
            <td>{unit[6]}/{unit[7]}</td>
            <td>{unit[8]}</td>
            <td>{unit[9]}</td>
            <td>{unit[10]}</td>
            <td>{unit[4]}</td>
          </tr>
        </tbody>
      </table>
    );

  }

}
