class Player {
  constructor(pnum) {
    this.pnum = pnum;
    this.prepared = false;
  }
}

module.exports = class Info {
  constructor(pid1, pid2) {
    this.players = {};
    this.players[pid1] = new Player(0);
    this.players[pid2] = new Player(1);
    this.phase = 0;
    this.turn = 1;
    this.state = (function() {
      const STATE = {
        PREP: 1,
        RUN: 2
      };
      let state = STATE.PREP;
      return {
        is: function(str) {
          return state == STATE[str];
        },
        set: function(str) {
          state = STATE[str];
        }
      };
    })();
  }

  isPlayer(pid) {
    return this.players[pid] != undefined;
  }

  pnum(pid) {
    if (!this.isPlayer(pid)) {
      return null;
    }
    return this.players[pid].pnum;
  }

  isPrepared(pid) {
    return this.players[pid].prepared;
  }

  prepare(pid) {
    this.players[pid].prepared = true;
    let engaged = true;
    Object.keys(this.players).forEach(pid => {
      engaged = engaged && this.players[pid].prepared;
    });
    if (engaged) {
      this.state.set('RUN');
    }
  }

  isPhaser(pid) {
    return this.players[pid].pnum == this.phase;
  }

  changePhase() {
    this.phase = (this.phase + 1) % 2;
    if (this.phase == 0) {
      this.turn += 1;
    }
  }

};
