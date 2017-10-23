const firebase = require('firebase/app');
require('firebase/database');
firebase.initializeApp({
  apiKey: 'AIzaSyAhcpuo8blTSLD_sGosWeWpox-drQJr7Es',
  databaseURL: 'https://instant-strategy.firebaseio.com',
  projectId: 'instant-strategy',
});
module.exports = firebase;

