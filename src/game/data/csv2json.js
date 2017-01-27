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
      const keys = csvData[0];
      const jsonData = {};
      for(let i=1; i<csvData.length; i++) {
        const klassData = {};
        keys.forEach((key, j) => {
          klassData[key] = csvData[i][j];
        });
        jsonData[klassData.id] = klassData;
      }
      if (callback) callback(jsonData);
    });
  });
};
