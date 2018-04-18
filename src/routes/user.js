const uid = require('uid-safe').sync;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const numOfDeck = 12;

import unitData from '../game/data/unitData.js';

export function create(req, res) {
  const deck = randomDeck();
  const userId = createUserId();
  res.cookie(
    'jwt',
    jwt.sign(
      {
        userId,
        deck
      },
      JWT_SECRET
    )
  );
  return {
    userId,
    deck
  };
}

function createUserId() {
  return `${uid(12)}-${new Date().getTime()}`;
}

export function get(req, res) {
  res.send(req.jwt);
}

export function setDeck(req, res) {
  const ids = req.body.ids;
  let deck;
  if (ids && ids.length == numOfDeck) {
    deck = ids;
  } else {
    deck = randomDeck();
  }
  res.cookie(
    'jwt',
    jwt.sign(
      {
        userId: req.jwt.userId,
        deck
      },
      JWT_SECRET
    )
  );

  res.send({ deck });
}

function randomDeck() {
  const units = Array.from(unitData.values());
  const common = Object.values(units).filter(unit => unit.cost == 3);
  const elite = Object.values(units).filter(unit => unit.cost == 4);
  const epic = Object.values(units).filter(unit => unit.cost == 5);
  const deck = [].concat(
    randomUnits(common, 3),
    randomUnits(elite, 6),
    randomUnits(epic, 3)
  );
  return deck;
}

function randomUnits(units, count) {
  const indexes = [];
  while (indexes.length < count) {
    const rand = Math.random();
    const sel = Math.floor(rand * units.length);
    indexes.push(sel);
  }
  return indexes.map(index => {
    return units[index].id;
  });
}
