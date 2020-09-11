'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('uuid'),
    uuidv4 = _require.v4;

var client = require('../../config/database');

var model = require('../models/users');

var listUsers = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return client.query('SELECT * FROM users');

          case 2:
            return _context.abrupt("return", _context.sent.rows);

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function listUsers() {
    return _ref.apply(this, arguments);
  };
}();

var findUser = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(id) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return model.userId.validateAsync(id);

          case 2:
            _context2.next = 4;
            return client.query('SELECT * FROM users WHERE user_id = $1 LIMIT 1', [id]);

          case 4:
            return _context2.abrupt("return", _context2.sent.rows[0]);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function findUser(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var findUserByCookie = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(id) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return model.cookieId.validateAsync(id);

          case 2:
            _context3.next = 4;
            return client.query('SELECT * FROM users WHERE cookie_id = $1 LIMIT 1', [id]);

          case 4:
            return _context3.abrupt("return", _context3.sent.rows[0]);

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function findUserByCookie(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

var findUserByStripe = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(id) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return model.stripeId.validateAsync(id);

          case 2:
            _context4.next = 4;
            return client.query('SELECT * FROM users WHERE stripe_id = $1 LIMIT 1', [id]);

          case 4:
            return _context4.abrupt("return", _context4.sent.rows[0]);

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function findUserByStripe(_x3) {
    return _ref4.apply(this, arguments);
  };
}();

var insertUser = function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(_ref5) {
    var userId, stripeId, username, email, avatarUrl, COLUMNS, VALUES;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            userId = _ref5.userId, stripeId = _ref5.stripeId, username = _ref5.username, email = _ref5.email, avatarUrl = _ref5.avatarUrl;
            _context5.next = 3;
            return model.schema.validateAsync({
              userId: userId,
              stripeId: stripeId,
              username: username,
              email: email,
              avatarUrl: avatarUrl
            });

          case 3:
            COLUMNS = 'user_id, cookie_id, stripe_id, username, email, avatar_url, created';
            VALUES = [userId, uuidv4(), stripeId, username, email, avatarUrl, Date.now()];
            _context5.next = 7;
            return client.query("INSERT INTO users (".concat(COLUMNS, ") VALUES ($1, $2, $3, $4, $5, $6, $7)"), VALUES);

          case 7:
            return _context5.abrupt("return", _context5.sent);

          case 8:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function insertUser(_x4) {
    return _ref6.apply(this, arguments);
  };
}();

var updateUser = function () {
  var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(id, column, value) {
    var FIELDS, COLUMN_CAMEL_CASE;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            column = column.toLowerCase();

            if (!(column === 'user_id')) {
              _context6.next = 3;
              break;
            }

            return _context6.abrupt("return");

          case 3:
            _context6.next = 5;
            return client.query('SELECT * FROM users WHERE false');

          case 5:
            FIELDS = _context6.sent.fields.map(function (f) {
              return f.name;
            });

            if (FIELDS.includes(column)) {
              _context6.next = 8;
              break;
            }

            return _context6.abrupt("return");

          case 8:
            COLUMN_CAMEL_CASE = column.replace(/(_\w)/g, function (letter) {
              return letter[1].toUpperCase();
            });

            if (model[COLUMN_CAMEL_CASE]) {
              _context6.next = 11;
              break;
            }

            return _context6.abrupt("return");

          case 11:
            _context6.next = 13;
            return model.userId.validateAsync(id);

          case 13:
            _context6.next = 15;
            return model[COLUMN_CAMEL_CASE].validateAsync(value);

          case 15:
            _context6.next = 17;
            return client.query("UPDATE users SET ".concat(column, " = $1 WHERE user_id = $2"), [column, value, id]);

          case 17:
            return _context6.abrupt("return", _context6.sent);

          case 18:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function updateUser(_x5, _x6, _x7) {
    return _ref7.apply(this, arguments);
  };
}();

module.exports = {
  listUsers: listUsers,
  findUser: findUser,
  findUserByCookie: findUserByCookie,
  findUserByStripe: findUserByStripe,
  insertUser: insertUser,
  updateUser: updateUser
};