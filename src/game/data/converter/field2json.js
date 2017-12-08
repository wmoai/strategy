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
      jsonData.width = csvData[0][1];
      jsonData.height = csvData[0][2];
      jsonData.name = csvData[0][3];
      jsonData.terrain = Array.prototype.concat.apply([], csvData.slice(1, jsonData.height+1));

      const info = {};
      for (let i = jsonData.height+1; i<csvData.length; i++) {
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
