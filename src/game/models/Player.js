// @flow

export default class Player {
  id: string;
  isHuman: boolean;
  isOffense: boolean;
  deck: Array<number>;
  isReady: boolean;
  selection: Array<{ isOffense: boolean, unitId: number }>;

  constructor(data?: any) {
    if (data) {
      if (data.id != undefined) this.id = data.id;
      if (data.isHuman != undefined) this.isHuman = data.isHuman;
      if (data.isOffense != undefined) this.isOffense = data.isOffense;
      if (data.deck != undefined) this.deck = data.deck;
      if (data.isReady != undefined) this.isReady = data.isReady;
    }
    this.selection = [];
  }

  toData(): any {
    return {
      id: this.id,
      isHuman: this.isHuman,
      isOffense: this.isOffense,
      deck: this.deck,
      isReady: this.isReady,
    };
  }

  reset() {
    this.isReady = false;
    this.selection = [];
  }

}
