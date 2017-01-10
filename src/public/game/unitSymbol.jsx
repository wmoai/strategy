const React = require('react');

module.exports = class UnitSymbol extends React.Component {
  render() {
    const unit = this.props.unit;
    if (!unit) {
      return null;
    }
    let unitClass = ['unit'];
    if (unit.acted) {
      unitClass.push('standby');
    } else if (unit.pnum == this.props.pnum || (!this.props.pnum && unit.pnum == 1)) {
      unitClass.push('army');
    } else {
      unitClass.push('enemy');
    }
    let hpPer = unit.hp / unit.klass.maxhp * 100;
    return (
      <div className={unitClass.join(' ')}>
        {unit.klass.name.charAt(0)}
        <div className='hpbar'>
          <div className='remain' style={{width:`${hpPer}%`}}></div>
        </div>
      </div>
    );
  }
};
