const Match = require('./Match.js');

const uid = require('uid-safe').sync;


module.exports = class Server {
  constructor() {
    this.matches = {};
  }

  createMatch() {
    const matchId = uid(24);
    const match = Match.create(matchId);
    
    this.matches[matchId] = match;
    return match;
  }

  existsMatch(matchId) {
    return this.matches[matchId] !== undefined && this.matches[matchId] !== null;
  }

  getMatch(matchId) {
    return this.matches[matchId];
  }

};
