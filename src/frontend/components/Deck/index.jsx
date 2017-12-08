import React from 'react';

export default class Deck extends React.Component {
  
  render() {
    const { deck } = this.props;
    if (!deck) {
      return null;
    }
    return (
      <table>
        <tbody>
          {deck.map((unit, i) => {
            return (
              <tr key={i}>
                <td>{unit.name}</td>
                <td>{unit.hp}</td>
                <td>{unit.pow}</td>
                <td>{unit.dff}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}
