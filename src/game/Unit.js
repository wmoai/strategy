const Klass = require('./Klass.js');

module.exports = class Unit {
  constructor(opt) {
    if (opt !== undefined) {
      this.pnum = opt.pnum;
      this.klass = opt.klass;
      this.hp = opt.hp || opt.klass.maxhp;
      this.acted = opt.acted || false;
    }
  }

  static parse(data) {
    return new Unit({
      pnum: data[0],
      klass: new Klass(data[1]),
      hp: data[2],
      acted: data[3]
    });
  }

  data() {
    return [
      this.pnum,
      this.klass.data(),
      this.hp,
      this.acted
    ];
  }

  act(target) {
    if (!target) {
      return;
    }
    if (this.klass.healer) {
      target.hp += this.klass.pow;
      target.hp = Math.min(target.hp, target.klass.maxhp);
    } else {
      const hitr = 80 + this.klass.skl * 3;
      const avoidr = target.klass.skl + target.klass.luc * 2;
      if (Math.random() < (hitr - avoidr) / 100) {
        const crtr = this.klass.skl * 2 + this.klass.luc;
        const prtr = target.klass.luc * 3;
        let pr = 1;
        if (Math.random() < (crtr - prtr) / 100) {
          pr = 3;
        }
        if (this.klass.magical) {
          const damage = Math.max(this.klass.pow * pr - target.klass.fth, 0);
          target.hp = Math.max(target.hp - damage, 0);
        } else {
          const damage = Math.max(this.klass.pow * pr - target.klass.dff, 0);
          target.hp = Math.max(target.hp - damage, 0);
        }
      }
    }
  }

};
