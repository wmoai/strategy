const Player = require('./Player.js');

module.exports = class COM extends Player {

  constructor(args) {
    super(args);
    return this.withMutations(mnt => {
      mnt.set('id', 'com')
        .set('deck', [1,2,3,4,5,6])
        .set('ready', true);
    });
  }


};
