const fs = require('fs');
const csv = require('csv');

module.exports = function(filepath, callback) {
  if (!filepath.match(/\.csv$/)) {
    process.exit(1);
  }

  var readableStream = fs.createReadStream(filepath, {encoding: 'utf-8', bufferSize: 1});
  let csvFile = '';
  readableStream.on('data', function(data) {
    csvFile += data;
  });
  readableStream.on('end', function() {
    csv.parse(csvFile, {auto_parse:true}, (err, csvData) => {
      const jsonData = {};
      jsonData.id = csvData[0][0];
      jsonData.name = csvData[1][0];
      jsonData.width = csvData[2][0];
      jsonData.height = csvData[2][1];
      jsonData.terrain = Array.prototype.concat.apply([], csvData.slice(3, jsonData.height+3));

      const info = {};
      for (let i = jsonData.height+3; i<csvData.length; i++) {
        const key = csvData[i][0];
        if (key && !key.match(/^\#/)) {
          info[key] = csvData[i].slice(1).filter(data => data != '');
        }
      }
      jsonData.info = info;
      if (callback) callback(jsonData);
    });
  });

};
