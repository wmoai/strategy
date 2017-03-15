const React = require('react');

module.exports = class Container extends React.Component {
  render() {
    const unit = this.props.unit;
    if (!unit) {
      return <div></div>;
    }
    const status = unit.status();
    return (
      <table className="refunit">
        <tbody>
          <tr>
            <th colSpan="2">{status.name}</th>
          </tr>
          <tr>
            <th>HP</th>
            <td>{unit.hp}</td>
          </tr>
          <tr>
            <th>力</th>
            <td>{status.pow}</td>
          </tr>
          <tr>
            <th>守</th>
            <td>{status.dff}</td>
          </tr>
          <tr>
            <th>信</th>
            <td>{status.fth}</td>
          </tr>
          <tr>
            <th>技</th>
            <td>{status.skl}</td>
          </tr>
          <tr>
            <th>運</th>
            <td>{status.luc}</td>
          </tr>
          <tr>
            <th>移</th>
            <td>{status.move}</td>
          </tr>
        </tbody>
      </table>
    );

  }

};
