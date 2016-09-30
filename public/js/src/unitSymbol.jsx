import React from 'react';


export default class UnitSymbol extends React.Component {
  render() {
    const unit = this.props.unit;
    if (!unit) {
      return null;
    }
    let unitClass = ['unit'];
    if (unit.isActed()) {
      unitClass.push('standby');
    } else if (unit.player == 1) {
      unitClass.push('army');
    } else {
      unitClass.push('enemy');
    }
    let hpPer = unit.hp / unit.maxHp * 100;
    return (
      <div className={unitClass.join(' ')}>
        {unit.symbol}
        <div className='hpbar'>
          <div className='remain' style={{width:`${hpPer}%`}}></div>
        </div>
      </div>
    );
  }
}
