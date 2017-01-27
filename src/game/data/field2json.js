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
      jsonData.width = csvData[0][0];
      jsonData.height = csvData[0][1];
      jsonData.array = Array.prototype.concat.apply([], csvData.slice(1, jsonData.height+1));
      jsonData.initPos = {
        1: csvData[jsonData.height+1].slice(0,10),
        2: csvData[jsonData.height+2].slice(0,10)
      };
      if (callback) callback(jsonData);
    });
  });

};
