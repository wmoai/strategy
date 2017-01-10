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
        <thead>
          <tr>
            <th></th>
            <th>HP</th>
            <th>力</th>
            <th>守</th>
            <th>信</th>
            <th>技</th>
            <th>運</th>
            <th>移</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>{klass.name}</th>
            <td>{unit.hp}/{klass.maxhp}</td>
            <td>{klass.pow}</td>
            <td>{klass.dff}</td>
            <td>{klass.fth}</td>
            <td>{klass.skl}</td>
            <td>{klass.luc}</td>
            <td>{klass.move}</td>
          </tr>
        </tbody>
      </table>
    );

  }

};
