'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var _require = require('../../database/repositories/users'),
    findUser = _require.findUser;

var _require2 = require('../../database/repositories/user-roles'),
    findRoleFromUserRole = _require2.findRoleFromUserRole;

var _require3 = require('../users'),
    deleteUser = _require3.deleteUser;

module.exports = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var io, socket, userId, _socket$request$role, USER, ROLE, IMPORTANCE_ADMIN, IMPORTANCE_USER;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            io = _ref.io, socket = _ref.socket, userId = _ref.userId;
            _context.prev = 1;

            if ((_socket$request$role = socket.request.role) === null || _socket$request$role === void 0 ? void 0 : _socket$request$role['modify_members']) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You don\'t have permission to delete a member.'));

          case 4:
            _context.prev = 4;
            _context.next = 7;
            return Joi.string().alphanum().required().validateAsync(userId);

          case 7:
            _context.next = 12;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](4);
            return _context.abrupt("return", socket.emit('send-error', 'Parameter validation failed: ' + _context.t0.message));

          case 12:
            _context.next = 14;
            return findUser(userId);

          case 14:
            USER = _context.sent;

            if (USER) {
              _context.next = 17;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'User id doesn\'t exist in database.'));

          case 17:
            _context.next = 19;
            return findRoleFromUserRole(userId);

          case 19:
            ROLE = _context.sent;

            if (ROLE) {
              _context.next = 22;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'User doesn\'t have a role.'));

          case 22:
            IMPORTANCE_ADMIN = socket.request.role.importance;
            IMPORTANCE_USER = ROLE.importance || 10;

            if (!(IMPORTANCE_ADMIN > 2 && IMPORTANCE_ADMIN >= IMPORTANCE_USER || IMPORTANCE_ADMIN > IMPORTANCE_USER)) {
              _context.next = 26;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', "You don't have permission to delete a user with '".concat(ROLE.name, "' role.")));

          case 26:
            _context.next = 28;
            return deleteUser(userId);

          case 28:
            if (!_context.sent) {
              _context.next = 35;
              break;
            }

            console.log("User '".concat(socket.request.user.username, "' deleted user '").concat(USER.username, "'."));
            io.sockets.emit('get-member-list');
            socket.emit('close-member-edit');
            socket.emit('send-message', "User '".concat(USER.username, "' has been deleted."));
            _context.next = 36;
            break;

          case 35:
            socket.emit('send-error', 'Couldn\'t delete user role from database.');

          case 36:
            _context.next = 41;
            break;

          case 38:
            _context.prev = 38;
            _context.t1 = _context["catch"](1);
            console.error(_context.t1);

          case 41:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 38], [4, 9]]);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();