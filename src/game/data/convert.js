const fs = require('fs');

const csv2json = require('./csv2json.js');
const field2json = require('./field2json.js');

csv2json(`${__dirname}/csv/geo.csv`, json => {
  fs.writeFile(`${__dirname}/json/geo.json`, JSON.stringify(json));
});

fs.readdirSync(`${__dirname}/csv/field`).forEach(filepath => {
  const filename = filepath.replace(/\.csv$/, '');
  field2json(`${__dirname}/csv/field/${filepath}`, json => {
    fs.writeFile(`${__dirname}/json/field/${filename}.json`, JSON.stringify(json));
  });
});

csv2json(`${__dirname}/csv/klass.csv`, klass => {
  fs.writeFile(`${__dirname}/json/klass.json`, JSON.stringify(klass));
  const klassTable = {};
  Object.keys(klass).forEach(key => {
    klassTable[klass[key].name] = key;
  });
  csv2json(`${__dirname}/csv/unit.csv`, unit => {
    Object.keys(unit).forEach(key => {
      unit[key].klass = klassTable[unit[key].klass];
    });
    fs.writeFile(`${__dirname}/json/unit.json`, JSON.stringify(unit));
  });
});
