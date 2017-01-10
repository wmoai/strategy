const Game = require('./Game.js');
const Player = require('./Player.js');
const Klass = require('./Klass.js');
const Unit = require('./Unit.js');

const smplField = require('./sampleField.js');
const smplklass = require('./klass.json');

module.exports = class GameServer {
  constructor(client) {
    this.client = client;
  }
  init(gid, userId1, userId2) {
    const game = new Game(gid);
    game.map.setField(smplField);
    game.size = 7;
    const player = new Player([userId1, userId2]);
    this.save(game, player);
  }
  save(game, player, callback) {
    const data = {
      data: game.data(),
      player: player.data()
    };
    const key = `game:${game.gid}`;
    this.client.multi()
      .set([key, JSON.stringify(data)])
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
  get(gid, callback) {
    this.client.get(`game:${gid}`, (err, json) => {
      if (err || !json) {
        return callback(new Error('game not found'));
      }
      const data = JSON.parse(json);
      const game = new Game(gid);
      game.map.setField(smplField);
      game.restore(data.data);
      const player = new Player(data.player);
      callback(null, game, player);
    });
  }

  isPrepared(gid, userId, callback) {
    this.client.exists(`game:${gid}:sortie`, (err, exists) => {
      if (err) {
        throw err;
      }
      //TODO check id
      callback(exists === 1);
    });
  }

  klassList() {
    //TODO my and rival's
    return smplklass;
  }

  saveSortie(gid, userId, klassIds, callback) {
    this.get(gid, (err, game, player) => {
      if (err) {
        return;
      }
      if (!player.isPlayer(userId)) {
        return;
      }
      const key = `game:${gid}:sortie`;
      this.client.multi()
        .hset([key, userId, JSON.stringify(klassIds)])
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
    this.get(gid, (err, game, player) => {
      if (err) {
        return callback(err);
      }
      this.client.hgetall(`game:${gid}:sortie`, (err, sorties) => {
        if (err) {
          throw err;
        }
        let prepared = true;
        player.userIds.forEach(userId => {
          prepared = prepared && sorties[userId] != undefined;
        });
        if (!prepared) {
          return callback(null);
        }
        player.userIds.forEach(userId => {
          const pnum = player.pnum(userId);
          const klassIds = JSON.parse(sorties[userId]);
          klassIds.forEach((klassId, seq) => {
            const unit = new Unit({
              pnum: pnum,
              klass: new Klass(smplklass[klassId])
            });
            const cid = game.map.field.initPos[pnum][seq];
            game.map.putUnit(cid, unit);
          });
        });
        game.turn = 1;
        game.phase = player.firstPnum();
        this.save(game, player, () => {
          callback(game);
        });
      });
    });
  }

  action(gid, userId, fromCid, toCid, targetCid, callback) {
    this.get(gid, (err, game, player) => {
      if (err) {
        throw err;
      }
      const pnum = player.pnum(userId);
      const unit = game.map.unit(fromCid);
      if (!game.isRun() || game.phase != pnum || !unit || unit.pnum != pnum) {
        return;
      }
      if (!game.map.isMovable(fromCid, toCid)) {
        return;
      }
      if (targetCid && !game.map.isActionable(unit, toCid, targetCid)) {
        return;
      }
      game.map.moveUnit(fromCid, toCid);
      game.map.actUnit(toCid, targetCid);

      if (game.map.isEndPhase(pnum)) {
        game.map.resetUnitsActed();
        game.changePhase(player.anotherPnum(game.phase));
      }

      this.save(game, player, () => {
        callback(game);
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


