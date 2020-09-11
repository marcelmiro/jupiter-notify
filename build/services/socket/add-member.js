'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var _require = require('../../database/repositories/users'),
    findUser = _require.findUser;

var _require2 = require('../../database/repositories/user-roles'),
    findUserRole = _require2.findUserRole,
    insertUserRole = _require2.insertUserRole;

var _require3 = require('../../database/repositories/roles'),
    findRoleByName = _require3.findRoleByName;

var _require4 = require('../discord/utils'),
    addDiscordRole = _require4.addDiscordRole;

module.exports = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var io, socket, userId, role, _socket$request$role, USER, ROLE, IMPORTANCE_ADMIN, IMPORTANCE_USER;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            io = _ref.io, socket = _ref.socket, userId = _ref.userId, role = _ref.role;
            _context.prev = 1;

            if ((_socket$request$role = socket.request.role) === null || _socket$request$role === void 0 ? void 0 : _socket$request$role['modify_members']) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You don\'t have permission to add a member.'));

          case 4:
            _context.prev = 4;
            _context.next = 7;
            return Joi.object().keys({
              userId: Joi.string().alphanum().required(),
              role: Joi.string().required()
            }).required().validateAsync({
              userId: userId,
              role: role
            });

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
            return findUserRole(userId);

          case 19:
            if (!_context.sent) {
              _context.next = 21;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'User already has a role.'));

          case 21:
            _context.next = 23;
            return findRoleByName(role);

          case 23:
            ROLE = _context.sent;

            if (ROLE) {
              _context.next = 26;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'Role doesn\'t exist.'));

          case 26:
            if (!(role.toLowerCase() === 'renewal')) {
              _context.next = 28;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You can\'t add members to the renewal role.'));

          case 28:
            IMPORTANCE_ADMIN = socket.request.role.importance;
            IMPORTANCE_USER = ROLE.importance || 10;

            if (!(IMPORTANCE_ADMIN > 2 && IMPORTANCE_ADMIN >= IMPORTANCE_USER || IMPORTANCE_ADMIN > IMPORTANCE_USER)) {
              _context.next = 32;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', "You don't have permission to add a user to '".concat(ROLE.name, "' role.")));

          case 32:
            _context.next = 34;
            return insertUserRole(userId, ROLE.role_id);

          case 34:
            if (!_context.sent) {
              _context.next = 42;
              break;
            }

            _context.next = 37;
            return addDiscordRole(userId, ROLE.role_id);

          case 37:
            console.log("User '".concat(socket.request.user.username, "' added '").concat(USER.username, "' to '").concat(ROLE.name, "' role."));
            io.sockets.emit('get-member-list');
            socket.emit('send-message', "User '".concat(USER.username, "' added to '").concat(ROLE.name, "' role."));
            _context.next = 43;
            break;

          case 42:
            socket.emit('send-error', 'Couldn\'t insert user role to database.');

          case 43:
            _context.next = 48;
            break;

          case 45:
            _context.prev = 45;
            _context.t1 = _context["catch"](1);
            console.error(_context.t1);

          case 48:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 45], [4, 9]]);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();