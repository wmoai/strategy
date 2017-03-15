const Unit = require('./Unit.js');
const Match = require('./Match.js');

const unitMaster = require('./data/json/unit.json');


module.exports = class GameServer {
  constructor(client) {
    this.client = client;
  }
  createMatch(gid, uid1, deck1, uid2, deck2) {
    const match = Match.create(gid);
    match.addPlayer(uid1, deck1);
    match.addPlayer(uid2, deck2);
    this.saveMatch(match);
  }
  saveMatch(match, callback) {
    const key = `game:${match.game.gid}`;
    this.client.multi()
      .set([key, JSON.stringify(match.data())])
      .expire([key, 36000])
      .exec(err => {
        if (err) {
          throw err;
        }
        if (callback) {
          callback();
        }
      });
  }

  existsGame(gid, callback) {
    this.client.exists(`game:${gid}`, (err, reply) => {
      if (err) {
        return callback(false);
      }
      callback(reply === 1);
    });
  }

  getMatch(gid, callback) {
    this.client.get(`game:${gid}`, (err, json) => {
      if (err || !json) {
        return callback(new Error('game not found'));
      }
      const data = JSON.parse(json);
      const match = Match.restore(data);
      callback(null, match);
    });
  }

  isPrepared(gid, userId, callback) {
    this.client.hget([`game:${gid}:sortie`, userId], (err, data) => {
      callback(data != null);
    });
  }

  joiningUnitIds() {
    return Object.keys(unitMaster);
  }

  saveSortie(gid, userId, selectedIndexes, callback) {
    this.getMatch(gid, (err, match) => {
      if (err) {
        return;
      }
      if (!match.player.isPlayer(userId)) {
        return;
      }
      const key = `game:${gid}:sortie`;
      this.client.multi()
        .hset([key, userId, JSON.stringify(selectedIndexes)])
        .expire([key, 300])
        .exec(err => {
          if (err) {
            throw err;
          }
          callback();
        });
    });
  }

  engage(gid, callback) {
    this.getMatch(gid, (err, match) => {
      if (err) {
        return callback(err);
      }
      this.client.hgetall(`game:${gid}:sortie`, (err, sorties) => {
        if (err) {
          throw err;
        }
        let prepared = true;
        match.player.userIds.forEach(userId => {
          prepared = prepared && sorties[userId] != undefined;
        });
        if (!prepared) {
          return callback(null);
        }
        match.player.userIds.forEach(userId => {
          const pnum = match.player.pnum(userId);
          const selectedIndexes = JSON.parse(sorties[userId]);
          selectedIndexes.forEach((selectedIndex, seq) => {
            const unit = new Unit({
              pnum: pnum,
              unitId: this.joiningUnitIds()[selectedIndex]
            });
            const cid = match.game.map.field.initPos[pnum][seq];
            match.game.map.putUnit(cid, unit);
          });
        });
        match.game.turn = 1;
        match.game.phase = match.player.firstPnum();
        this.saveMatch(match, () => {
          callback(match);
        });
      });
    });
  }

  action(gid, userId, fromCid, toCid, targetCid, callback) {
    this.getMatch(gid, (err, match) => {
      if (err) {
        throw err;
      }
      const pnum = match.player.pnum(userId);
      const unit = match.game.map.unit(fromCid);
      if (!match.game.isRun() || match.game.phase != pnum || !unit || unit.pnum != pnum) {
        return;
      }
      if (!match.game.map.isMovable(fromCid, toCid)) {
        return;
      }
      if (targetCid && !match.game.map.isActionable(unit, toCid, targetCid)) {
        return;
      }
      match.game.map.moveUnit(fromCid, toCid);
      match.game.map.actUnit(toCid, targetCid);

      if (match.game.map.isEndPhase(pnum)) {
        match.game.map.resetUnitsActed();
        match.game.changePhase(match.player.anotherPnum(match.game.phase));
      }

      this.saveMatch(match, () => {
        callback(match);
      });
    });
  }

  winnedPnum(game) {
    let result = undefined;
    const survivedCount = game.map.survivedCount();
    const remainArmyPnums = Object.keys(survivedCount);
    if (remainArmyPnums.length == 1) {
      result = remainArmyPnums[0];
    }
    return result;
  }

};


