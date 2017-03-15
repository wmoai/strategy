const unitMaster = require('./data/json/unit.json');
const klassMaster = require('./data/json/klass.json');

module.exports = class Unit {
  constructor(opt) {
    if (opt !== undefined) {
      this.pnum = opt.pnum;
      this.unitId = opt.unitId;
      this.hp = opt.hp || this.status().hp;
      this.acted = opt.acted || false;
    }
  }

  status() {
    return unitMaster[this.unitId];
  }

  klass() {
    return klassMaster[this.status().klass];
  }

  static parse(data) {
    return new Unit({
      pnum: data[0],
      unitId: data[1],
      hp: data[2],
      acted: data[3]
    });
  }

  data() {
    return [
      this.pnum,
      this.unitId,
      this.hp,
      this.acted
    ];
  }

  act(target, geoAvoid=0) {
    if (!target) {
      return;
    }
    if (this.klass().healer) {
      target.hp += this.status().pow;
      target.hp = Math.min(target.hp, target.status().hp);
    } else {
      if (Math.random() < this.hitRate(target, geoAvoid) / 100) {
        const isCrit = Math.random() < this.critRate(target) / 100;
        target.hp = Math.max(target.hp - this.effect(target, isCrit), 0);
      }
    }
  }

  hitRate(target, geoAvoid=0) {
    if (!target) {
      return 0;
    }
    if (this.klass().healer) {
      return 100;
    }
    const hitr = this.status().hit;
    const avoidr = target.status().luc;
    return Math.min(Math.max(Math.floor(hitr - avoidr - geoAvoid), 0), 100);
  }

  critRate(target) {
    if (this.klass().healer || !target) {
      return 0;
    }
    const crtr = this.status().skl;
    const prtr = target.status().luc;
    return Math.min(Math.max(Math.floor(crtr - prtr), 0), 100);
  }

  effect(target, crit=false) {
    if (!target) {
      return 0;
    }
    if (this.klass().healer) {
      return this.status().pow;
    }
    let effect = 0;
    if (this.klass().magical) {
      effect = Math.max(this.status().pow - target.status().fth, 1);
    } else {
      effect = Math.max(this.status().pow - target.status().dff, 1);
    }
    if (crit) {
      effect *= 3;
    }
    return effect;
  }

};

