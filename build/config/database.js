'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Client = require('pg').Client;

var client;

var setup = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var SETTINGS;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            client = new Client(process.env.DATABASE_URL);
            _context.next = 3;
            return client.connect();

          case 3:
            console.log('Database opened.');
            _context.next = 6;
            return client.query('SELECT name, value FROM settings');

          case 6:
            SETTINGS = _context.sent.rows;
            SETTINGS.forEach(function (_ref2) {
              var name = _ref2.name,
                  value = _ref2.value;
              process.env[name] = value;
            });
            console.log('Website config loaded.');
            return _context.abrupt("return", true);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function setup() {
    return _ref.apply(this, arguments);
  };
}();

module.exports = {
  setup: setup,
  query: function query(text, params, callback) {
    return client.query(text, params, callback);
  }
};