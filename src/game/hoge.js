const Server = require('./Server.js');
const redis = require('redis').createClient();
const server = new Server(redis);

const gid = 'sadjfk';
server.init(gid, 'pp1', 'pp2');

server.saveSortie(gid, 'pp1', [1,3,5], () => {});
// server.saveSortie(gid, 'pp2', [2,4,6], () => {});

server.engage(gid, (reply) => {
  console.log(reply);
});
