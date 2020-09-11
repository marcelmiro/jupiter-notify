'use strict';

var _process$env$COOKIE_K;

module.exports = {
  name: 'express:sess',
  keys: (_process$env$COOKIE_K = process.env.COOKIE_KEY) === null || _process$env$COOKIE_K === void 0 ? void 0 : _process$env$COOKIE_K.split(';'),
  maxAge: 7 * 24 * 60 * 60 * 1000
};