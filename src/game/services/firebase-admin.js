require('dotenv').config();
var admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FB_PROJECTID,
    clientEmail: process.env.FB_CLIENTEMAIL,
    privateKey: process.env.FB_PRIVATEKEY
  }),
  databaseURL: 'https://instant-strategy.firebaseio.com',
});
module.exports = admin;
