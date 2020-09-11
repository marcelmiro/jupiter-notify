'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var client = require('../../config/database');

var model = require('../models/roles');

var listRoles = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return client.query('SELECT * FROM roles NATURAL JOIN role_permissions');

          case 2:
            return _context.abrupt("return", _context.sent.rows);

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function listRoles() {
    return _ref.apply(this, arguments);
  };
}();

var findRole = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(id) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return model.roleId.validateAsync(id);

          case 2:
            _context2.next = 4;
            return client.query('SELECT * FROM roles NATURAL JOIN role_permissions WHERE role_id = $1 LIMIT 1', [id]);

          case 4:
            return _context2.abrupt("return", _context2.sent.rows[0]);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function findRole(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var findRoleByName = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(name) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return model.name.validateAsync(name);

          case 2:
            _context3.next = 4;
            return client.query('SELECT * FROM roles NATURAL JOIN role_permissions WHERE name = $1 LIMIT 1', [name.toLowerCase()]);

          case 4:
            return _context3.abrupt("return", _context3.sent.rows[0]);

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function findRoleByName(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

var findRolePermissions = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(id) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return model.roleId.validateAsync(id);

          case 2:
            _context4.next = 4;
            return client.query('SELECT * FROM role_permissions WHERE role_id = $1 LIMIT 1', [id]);

          case 4:
            return _context4.abrupt("return", _context4.sent.rows[0]);

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function findRolePermissions(_x3) {
    return _ref4.apply(this, arguments);
  };
}();

module.exports = {
  listRoles: listRoles,
  findRole: findRole,
  findRoleByName: findRoleByName,
  findRolePermissions: findRolePermissions
};