const React = require('react');

module.exports = class Container extends React.Component {
  render() {
    const unit = this.props.unit;
    if (!unit) {
      return <div></div>;
    }
    const klass = unit.klass;
    return (
      <table className="refunit">
        <tbody>
          <tr>
            <th colSpan="2">{klass.name}</th>
          </tr>
          <tr>
            <th>HP</th>
            <td>{unit.hp}</td>
          </tr>
          <tr>
            <th>力</th>
            <td>{klass.pow}</td>
          </tr>
          <tr>
            <th>守</th>
            <td>{klass.dff}</td>
          </tr>
          <tr>
            <th>信</th>
            <td>{klass.fth}</td>
          </tr>
          <tr>
            <th>技</th>
            <td>{klass.skl}</td>
          </tr>
          <tr>
            <th>運</th>
            <td>{klass.luc}</td>
          </tr>
          <tr>
            <th>移</th>
            <td>{klass.move}</td>
          </tr>
        </tbody>
      </table>
    );

  }

};
