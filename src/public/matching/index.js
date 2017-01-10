
import socketIOClient from 'socket.io-client';

window.onload = function() {
  const socket = socketIOClient('/matching');
  socket.on('done', id => {
    location.href= `/game/${id}`;
  });
};


