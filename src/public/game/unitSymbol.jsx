import React from 'react';

export default class UnitSymbol extends React.Component {
  render() {
    const u = this.props.unit;
    if (!u) {
      return null;
    }
    let c = ['unit'];
    if (u.acted) {
      c.push('standby');
    } else if (u.pnum == this.props.pnum || (!this.props.pnum && u.pnum == 1)) {
      c.push('army');
    } else {
      c.push('enemy');
    }
    let hpPer = u.hp / u.status().hp * 100;
    const tip = {backgroundImage: `url("/image/k_${u.klass().id}.png")`};
    return (
      <div
        className={c.join(' ')}
        >
        {u.status().name.charAt(0)}
        <div className='hpbar'>
          <div className='remain' style={{width:`${hpPer}%`}}></div>
        </div>
      </div>
    );
  }
}
