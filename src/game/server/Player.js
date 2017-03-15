module.exports = class Player {
  constructor() {
    this.userIds = [];
    this.deck = {};
    this.sortie = {};
  }

  data() {
    return {
      userIds: this.userIds,
      deck: this.deck
    };
  }

  static restore(data) {
    const player = new Player();
    if (!data) {
      return player;
    }
    player.userIds = data.userIds;
    player.deck = data.deck;
    return player;
  }

  add(id, deck) {
    this.userIds.push(id);
    this.deck[id] = deck;
  }

  isPlayer(userId) {
    return this.userIds.indexOf(userId) >= 0;
  }

  isReady(userId=null) {
    if (!userId) {
      let result = true;
      this.userIds.forEach(userId => {
        result &= this.isReady(userId);
      });
      return result;
    }
    return this.sortie[userId] != undefined;
  }

  setSortie(userId, selectedIndexes) {
    this.sortie[userId] = selectedIndexes;
  }

  pnum(userId) {
    return this.userIds.indexOf(userId) + 1;
  }

  firstPnum() {
    return 1;
  }

  anotherPnum(currentPnum) {
    let anotherPnum = undefined;
    for (let i=0; i<this.userIds.length; i++) {
      const userId = this.userIds[i];
      const pnum = this.pnum(userId);
      if (pnum != currentPnum) {
        anotherPnum = pnum;
        break;
      }
    }
    return anotherPnum;
  }

};
