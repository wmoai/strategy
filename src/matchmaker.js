const redis = require('./redis.js');
let waitDB = [];

exports.wait = function(id) {
  waitDB.push(id);
};

exports.remove = function(id) {
  waitDB = waitDB.filter(v => {
    return v != id;
  });
};

setInterval(function() {
  if (waitDB.length < 2) {
    return;
  }
  const match = [waitDB.shift(), waitDB.shift()];
  redis.lpush('matching', JSON.stringify(match));
}, 1000);
