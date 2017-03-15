import socketIOClient from 'socket.io-client';

let lockScreen = true;

window.onload = function() {
  const socket = socketIOClient('/matching');
  socket.on('done', id => {
    lockScreen = false;
    location.href= `/game/${id}`;
  });
};

window.onbeforeunload = function() {
  if (lockScreen) {
    return true;
  }
  return null;
};
