'use strict';

var ssl = {};

if (process.env.NODE_ENV !== 'production') {
  var fs = require('fs');

  ssl.key = fs.readFileSync('./ssl/localhost-key.pem');
  ssl.cert = fs.readFileSync('./ssl/localhost.pem');
}

module.exports = ssl;