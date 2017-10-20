const fs = require('fs');

const csv2json = require('./csv2json.js');
const field2json = require('./field2json.js');

csv2json(`${__dirname}/../csv/terrain.csv`, json => {
  fs.writeFileSync(`${__dirname}/../json/terrain.json`, JSON.stringify(json));
});


fs.readdirSync(`${__dirname}/../csv/field`).forEach(filepath => {
  if (!filepath.match(/\.csv$/)) {
    return;
  }
  const filename = filepath.replace(/\.csv$/, '');
  field2json(`${__dirname}/../csv/field/${filepath}`, json => {
    fs.writeFileSync(`${__dirname}/../json/field/${filename}.json`, JSON.stringify(json));
  });
});

let fieldIndexes = [];
fs.readdirSync(`${__dirname}/../json/field`).forEach(filepath => {
  if (!filepath.match(/\.json$/) || filepath.match(/index\.json/)) {
    return;
  }
  fieldIndexes.push(filepath);
});
fs.writeFileSync(`${__dirname}/../json/field/index.json`, JSON.stringify(fieldIndexes));


csv2json(`${__dirname}/../csv/klass.csv`, klass => {
  fs.writeFileSync(`${__dirname}/../json/klass.json`, JSON.stringify(klass));
});
csv2json(`${__dirname}/../csv/unit.csv`, unit => {
  fs.writeFileSync(`${__dirname}/../json/unit.json`, JSON.stringify(unit));
});

