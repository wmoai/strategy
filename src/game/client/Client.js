const unitMaster = require('../data/json/unit.json');

export default class Client {

  getMetaData(data) {
    const meta = {};
    meta.pnum = data.pnum;
    const deck = {
      army: [],
      enemy: []
    };
    if (data.deck) {
      Object.keys(data.deck).forEach(pnum => {
        if (pnum == data.pnum) {
          deck.army = this.getPrepUnits(data.deck[pnum]);
        } else {
          deck.enemy = this.getPrepUnits(data.deck[pnum]);
        }
      });
    }
    meta.deck = deck;
    return meta;
  }

  getPrepUnits(ids) {
    return ids.map(id => {
      return unitMaster[id];
    });
  }

  forecastBattle(game, unit, target, fromCellId, toCellId) {
    if (!unit || !target || !game.map.isActionable(unit, fromCellId, toCellId)) {
      return;
    }
    const result = {
      me: {
        name: unit.klass.name,
        hp: unit.hp
      },
      tg: {
        name: target.klass.name,
        hp: target.hp
      }
    };
    if (unit.klass.healer) {
      result.me.val = unit.klass.pow;
    } else {
      result.me.val = unit.effect(target);
      result.me.hit = unit.hitRate(target, game.map.field.avoid(toCellId));
      result.me.crit = unit.critRate(target);
    }
    if (!unit.klass.healer && !target.klass.healer) {
      if (game.map.isActionable(target, toCellId, fromCellId)) {
        result.tg.val = target.effect(unit);
        result.tg.hit = target.hitRate(unit, game.map.field.avoid(fromCellId));
        result.tg.crit = target.critRate(unit);
      }
    }
    return result;
  }

}
