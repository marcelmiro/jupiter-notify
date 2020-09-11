'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var client = require('../../config/database');

var model = require('../models/settings');

var listSettings = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return client.query('SELECT * FROM settings');

          case 2:
            return _context.abrupt("return", _context.sent.rows);

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function listSettings() {
    return _ref.apply(this, arguments);
  };
}();

var findSetting = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(name) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return model.name.validateAsync(name);

          case 2:
            _context2.next = 4;
            return client.query('SELECT * FROM settings WHERE name = $1 LIMIT 1', [name]);

          case 4:
            return _context2.abrupt("return", _context2.sent.rows[0]);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function findSetting(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var updateSetting = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(name, value) {
    var RESPONSE;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return model.schema.validateAsync({
              name: name,
              value: value
            });

          case 2:
            _context3.next = 4;
            return findSetting(name);

          case 4:
            if (_context3.sent) {
              _context3.next = 6;
              break;
            }

            return _context3.abrupt("return");

          case 6:
            _context3.next = 8;
            return client.query('UPDATE settings SET value = $1 WHERE name = $2', [value, name]);

          case 8:
            RESPONSE = _context3.sent;

            if (!RESPONSE) {
              _context3.next = 12;
              break;
            }

            process.env[name] = value;
            return _context3.abrupt("return", RESPONSE);

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function updateSetting(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();

module.exports = {
  listSettings: listSettings,
  findSetting: findSetting,
  updateSetting: updateSetting
};