
export function soloPlay() {
  return { type: 'soloPlay' };
}

export function createRoom() {
  return { type: 'createRoom' };
}

export function joinRoom(roomId) {
  return {
    type: 'joinRoom',
    payload: { roomId: roomId }
  };
}

export function leaveRoom() {
  return { type: 'leaveRoom' };
}

export function ready() {
  return { type: 'ready' };
}

export function selectUnits(selectedList) {
  return {
    type: 'selectUnits',
    payload: { selectedList: selectedList }
  };
}

export function selectCell(cellId) {
  return {
    type: 'selectCell',
    payload: { cellId: cellId }
  };
}

export function hoverCell(cellId) {
  return {
    type: 'hoverCell',
    payload: { cellId: cellId }
  };
}

export function endTurn() {
  return { type: 'endTurn' };
}

export function returnRoom() {
  return { type: 'returnRoom' };
}

export function endMyTurn(dispatch) {
  setTimeout(() => {
    dispatch({
      type: 'endMyTurn'
    });
  }, 2000);
}


