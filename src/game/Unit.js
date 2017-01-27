const Klass = require('./Klass.js');

const masterJson = require('./data/json/unit.json');

module.exports = class Unit {
  constructor(opt) {
    if (opt !== undefined) {
      this.pnum = opt.pnum;
      this.klass = opt.klass;
      this.hp = opt.hp || opt.klass.hp;
      this.acted = opt.acted || false;
      this.unitId = opt.unitId;
    }
  }

  static get(id) {

  }

  status() {
    return masterJson[this.unitId];
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
      target.hp = Math.min(target.hp, target.klass.hp);
    } else {
      if (Math.random() < this.hitRate(target) / 100) {
        const isCrit = Math.random() < this.critRate(target) / 100;
        target.hp = Math.max(target.hp - this.damage(target, isCrit), 0);
      }
    }
  }

  hitRate(target) {
    if (!target) {
      return 0;
    }
    const hitr = this.klass.hit;
    const avoidr = target.klass.luc;
    return Math.min(Math.max(Math.floor(hitr - avoidr), 0), 100);
  }

  critRate(target) {
    if (!target) {
      return 0;
    }
    const crtr = this.klass.skl;
    const prtr = target.klass.luc;
    return Math.min(Math.max(Math.floor(crtr - prtr), 0), 100);
  }

  damage(target, crit = false) {
    if (!target) {
      return 0;
    }
    let damage = 0;
    if (this.klass.magical) {
      damage = Math.max(this.klass.pow - target.klass.fth, 1);
    } else {
      damage = Math.max(this.klass.pow - target.klass.dff, 1);
    }
    if (crit) {
      damage *= 3;
    }
    return damage;
  }

};
