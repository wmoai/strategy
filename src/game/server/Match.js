const Game = require('../Game.js');
const Player = require('./Player.js');
const Unit = require('../Unit.js');
const unitMaster = require('../data/json/unit.json');

module.exports = class Match {

  static create(id) {
    const match = new Match();
    match.id = id;
    match.game = new Game();
    match.player = new Player();
    return match;
  }

  // serializeData() {
    // return {
      // game: this.game.data(),
      // player: this.player.data()
    // };
  // }

  // unserializeData(data) {
  // }

  // addPlayer(userId, deck) {
    // this.player.add(userId, deck);
  // }

  metaData(userId) {
    const data = {};
    if (this.player.isPlayer(userId)) {
      const deck = {};
      this.player.userIds.forEach(id => {
        const pnum = this.player.pnum(id);
        deck[pnum] = this.player.deck[id];
      });
      data.deck = deck;
      data.pnum = this.player.pnum(userId);
    }
    return data;
  }

  engage() {
    if (!this.player.isReady()) {
      return;
    }
    this.player.userIds.forEach(userId => {
      const pnum = this.player.pnum(userId);
      const selectedIndexes = this.player.sortie[userId];
      selectedIndexes.forEach((selectedIndex, seq) => {
        const unit = new Unit({
          pnum: pnum,
          unitId: this.joiningUnitIds()[selectedIndex]
        });
        const cid = this.game.map.field.initPos[pnum][seq];
        this.game = this.game.putUnit(cid, unit);
      });
    });
    this.game = this.game.start(this.player.firstPnum());
    return true;
  }
  joiningUnitIds() {
    return Object.keys(unitMaster);
  }


  action(userId, fromCid, toCid, targetCid) {
    let acted = false;
    const pnum = this.player.pnum(userId);
    const unit = this.game.map.unit(fromCid);
    if (!this.game.isRun() || this.game.phase != pnum || !unit || unit.pnum != pnum) {
      return acted;
    }
    if (!this.game.map.isMovable(fromCid, toCid)) {
      return acted;
    }
    if (targetCid && !this.game.map.isActionable(unit, toCid, targetCid)) {
      return acted;
    }
    this.game = this.game.withMutations(mnt => {
      mnt.moveUnit(fromCid, toCid)
        .actUnit(toCid, targetCid);
    });

    if (this.game.map.isEndPhase(pnum)) {
      this.game.map.resetUnitsActed();
      this.game = this.game.changePhase(this.player.anotherPnum(this.game.phase));
    }
    return true;
  }

  winnedPnum() {
    let result = undefined;
    const survivedCount = this.game.map.survivedCount();
    const remainArmyPnums = Object.keys(survivedCount);
    if (remainArmyPnums.length == 1) {
      result = remainArmyPnums[0];
    }
    return result;
  }

};
