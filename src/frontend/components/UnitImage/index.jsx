// @flow
import React from 'react';

export default function UnitImage({ klassId, isOffense, isGray=false }: {
  klassId: number,
  isOffense: boolean,
  isGray?: boolean,
}) {
  const ssize = 48;
  return  (
    <div className="cp-unit-image" style={{
      background: 'url(/image/units.png)',
      width: ssize,
      height: ssize,
      backgroundPositionX: -(klassId-1)*ssize,
      backgroundPositionY: isGray ? 0 : isOffense ? -ssize*2 : -ssize,
    }} />
  );
}
