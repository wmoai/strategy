import React from 'react';

export default function UnitSymbol({ unit, pnum }) {
  if (!unit) {
    return null;
  }
  let c = ['unit'];
  if (unit.acted) {
    c.push('standby');
  } else if (unit.pnum == pnum || (!pnum && unit.pnum == 1)) {
    c.push('army');
  } else {
    c.push('enemy');
  }
  let hpPer = unit.hp / unit.status().hp * 100;
  const tip = {backgroundImage: `url("/image/k_${unit.klass().id}.png")`};
  return (
    <div
      className={c.join(' ')}
    >
      {unit.status().name.charAt(0)}
      <div className='hpbar'>
        <div className='remain' style={{width:`${hpPer}%`}}></div>
      </div>
    </div>
  );
}
