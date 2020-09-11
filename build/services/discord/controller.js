'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../database/repositories/user-roles'),
    findUserRole = _require.findUserRole;

var _require2 = require('./utils'),
    addDiscordRole = _require2.addDiscordRole;

var commands = require('./commands');

var newDiscordMember = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(member) {
    var _member$constructor, ROLE;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (!(!(member === null || member === void 0 ? void 0 : (_member$constructor = member.constructor) === null || _member$constructor === void 0 ? void 0 : _member$constructor.name) || member.constructor.name !== 'GuildMember')) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return");

          case 3:
            _context.next = 5;
            return findUserRole(member.user.id);

          case 5:
            ROLE = _context.sent;

            if (ROLE === null || ROLE === void 0 ? void 0 : ROLE['role_id']) {
              _context.next = 8;
              break;
            }

            return _context.abrupt("return");

          case 8:
            _context.next = 10;
            return addDiscordRole(member.user.id, ROLE.role_id);

          case 10:
            return _context.abrupt("return", _context.sent);

          case 13:
            _context.prev = 13;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0);

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 13]]);
  }));

  return function newDiscordMember(_x) {
    return _ref.apply(this, arguments);
  };
}();

var newDiscordMessage = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(message) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (!message.author.bot) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return");

          case 3:
            if (!(message.channel.type === 'dm')) {
              _context2.next = 6;
              break;
            }

            _context2.next = 6;
            return commands(message);

          case 6:
            _context2.next = 11;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](0);
            console.error(_context2.t0);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 8]]);
  }));

  return function newDiscordMessage(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

module.exports = {
  newDiscordMember: newDiscordMember,
  newDiscordMessage: newDiscordMessage
};