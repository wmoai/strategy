
module.exports = class Player {
  constructor(userIds) {
    this.userIds = userIds;
    this.pnumMap = {};
    if (userIds) {
      userIds.forEach((userId, i) => {
        this.pnumMap[userId] = i + 1;
      });
    }
  }

  data() {
    return this.userIds;
  }

  isPlayer(userId) {
    return this.pnumMap[userId] != undefined;
  }

  pnum(userId) {
    return this.pnumMap[userId];
  }

  firstPnum() {
    return this.pnumMap[this.userIds[0]];
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
