import React from 'react';


export default class UnitSymbol extends React.Component {
  render() {
    const unit = this.props.unit;
    if (!unit) {
      return null;
    }
    let unitClass = ['unit'];
    if (unit[13]) {
      unitClass.push('standby');
    } else if (unit[2] == 1) {
      unitClass.push('army');
    } else {
      unitClass.push('enemy');
    }
    let hpPer = unit[6] / unit[7] * 100;
    return (
      <div className={unitClass.join(' ')}>
        {unit[3]}
        <div className='hpbar'>
          <div className='remain' style={{width:`${hpPer}%`}}></div>
        </div>
      </div>
    );
  }
}
