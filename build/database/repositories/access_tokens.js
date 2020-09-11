'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('uuid'),
    uuidv4 = _require.v4;

var client = require('../../config/database');

var model = require('../models/access_tokens');

var findAccessToken = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(userId) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return model.userId.validateAsync(userId);

          case 2:
            _context.next = 4;
            return client.query('SELECT * FROM access_tokens WHERE user_id = $1 LIMIT 1', [userId]);

          case 4:
            return _context.abrupt("return", _context.sent.rows[0]);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function findAccessToken(_x) {
    return _ref.apply(this, arguments);
  };
}();

var findAccessTokenByToken = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(token) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return model.accessToken.validateAsync(token);

          case 2:
            _context2.next = 4;
            return client.query('SELECT * FROM access_tokens WHERE access_token = $1 LIMIT 1', [token]);

          case 4:
            return _context2.abrupt("return", _context2.sent.rows[0]);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function findAccessTokenByToken(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var insertAccessToken = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(userId) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return model.userId.validateAsync(userId);

          case 2:
            _context3.next = 4;
            return client.query('INSERT INTO access_tokens (user_id, access_token, iv, created) VALUES ($1, $2, $3, $4)', [userId, uuidv4(), uuidv4().slice(0, parseInt(process.env.ENCRYPTION_IV_LENGTH)), Date.now()]);

          case 4:
            if (!_context3.sent) {
              _context3.next = 8;
              break;
            }

            _context3.next = 7;
            return findAccessToken(userId);

          case 7:
            return _context3.abrupt("return", _context3.sent);

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function insertAccessToken(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var deleteAccessToken = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(userId) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return model.userId.validateAsync(userId);

          case 2:
            _context4.next = 4;
            return client.query('DELETE FROM access_tokens WHERE user_id = $1', [userId]);

          case 4:
            return _context4.abrupt("return", _context4.sent);

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function deleteAccessToken(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

module.exports = {
  findAccessToken: findAccessToken,
  findAccessTokenByToken: findAccessTokenByToken,
  insertAccessToken: insertAccessToken,
  deleteAccessToken: deleteAccessToken
};