'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var client = require('../../config/database');

var model = require('../models/user-roles');

var _require = require('./roles'),
    findRole = _require.findRole,
    findRoleByName = _require.findRoleByName;

var listUserRoles = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return client.query('SELECT * FROM user_roles');

          case 2:
            return _context.abrupt("return", _context.sent.rows);

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function listUserRoles() {
    return _ref.apply(this, arguments);
  };
}();

var listUsersAndRolesFromUserRoles = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return client.query('SELECT * FROM user_roles NATURAL JOIN users NATURAL JOIN roles NATURAL JOIN role_permissions');

          case 2:
            return _context2.abrupt("return", _context2.sent.rows);

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function listUsersAndRolesFromUserRoles() {
    return _ref2.apply(this, arguments);
  };
}();

var listRenewalUsers = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var ROLE;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return findRoleByName('renewal');

          case 2:
            ROLE = _context3.sent;

            if (ROLE === null || ROLE === void 0 ? void 0 : ROLE['role_id']) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt("return");

          case 5:
            _context3.next = 7;
            return client.query('SELECT * FROM user_roles NATURAL JOIN users WHERE role_id = $1', [ROLE.role_id]);

          case 7:
            return _context3.abrupt("return", _context3.sent.rows);

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function listRenewalUsers() {
    return _ref3.apply(this, arguments);
  };
}();

var findUserRole = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(id) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return model.userId.validateAsync(id);

          case 2:
            _context4.next = 4;
            return client.query('SELECT * FROM user_roles WHERE user_id = $1 LIMIT 1', [id]);

          case 4:
            return _context4.abrupt("return", _context4.sent.rows[0]);

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function findUserRole(_x) {
    return _ref4.apply(this, arguments);
  };
}();

var findRoleFromUserRole = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(id) {
    var USER_ROLE;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return model.userId.validateAsync(id);

          case 2:
            _context5.next = 4;
            return client.query('SELECT * FROM user_roles WHERE user_id = $1 LIMIT 1', [id]);

          case 4:
            USER_ROLE = _context5.sent.rows[0];

            if (!(USER_ROLE === null || USER_ROLE === void 0 ? void 0 : USER_ROLE['role_id'])) {
              _context5.next = 11;
              break;
            }

            _context5.next = 8;
            return findRole(USER_ROLE.role_id);

          case 8:
            _context5.t0 = _context5.sent;
            _context5.next = 12;
            break;

          case 11:
            _context5.t0 = undefined;

          case 12:
            return _context5.abrupt("return", _context5.t0);

          case 13:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function findRoleFromUserRole(_x2) {
    return _ref5.apply(this, arguments);
  };
}();

var insertUserRole = function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(userId, roleId) {
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return model.schema.validateAsync({
              userId: userId,
              roleId: roleId
            });

          case 2:
            _context6.next = 4;
            return client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);

          case 4:
            return _context6.abrupt("return", _context6.sent);

          case 5:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function insertUserRole(_x3, _x4) {
    return _ref6.apply(this, arguments);
  };
}();

var updateUserRole = function () {
  var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(userId, roleId) {
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return model.schema.validateAsync({
              userId: userId,
              roleId: roleId
            });

          case 2:
            _context7.next = 4;
            return client.query('UPDATE user_roles SET role_id = $1 WHERE user_id = $2', [roleId, userId]);

          case 4:
            return _context7.abrupt("return", _context7.sent);

          case 5:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function updateUserRole(_x5, _x6) {
    return _ref7.apply(this, arguments);
  };
}();

var deleteUserRole = function () {
  var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(id) {
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return model.userId.validateAsync(id);

          case 2:
            _context8.next = 4;
            return client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);

          case 4:
            return _context8.abrupt("return", _context8.sent);

          case 5:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function deleteUserRole(_x7) {
    return _ref8.apply(this, arguments);
  };
}();

module.exports = {
  listUserRoles: listUserRoles,
  listUsersAndRolesFromUserRoles: listUsersAndRolesFromUserRoles,
  listRenewalUsers: listRenewalUsers,
  findUserRole: findUserRole,
  findRoleFromUserRole: findRoleFromUserRole,
  insertUserRole: insertUserRole,
  updateUserRole: updateUserRole,
  deleteUserRole: deleteUserRole
};