'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../../database/repositories/user-roles'),
    findUserRole = _require.findUserRole;

var help = require('./help');

var generate = require('./generate');

var reset = require('./reset');

var logout = require('./logout');

var get = require('./get');

module.exports = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(message) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return findUserRole(message.author.id);

          case 2:
            if (_context.sent) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return");

          case 4:
            _context.t0 = message.content;
            _context.next = _context.t0 === '!help' ? 7 : _context.t0 === '!generate' ? 10 : _context.t0 === '!reset' ? 13 : _context.t0 === '!logout' ? 16 : _context.t0 === '!get' ? 19 : 22;
            break;

          case 7:
            _context.next = 9;
            return help(message);

          case 9:
            return _context.abrupt("break", 22);

          case 10:
            _context.next = 12;
            return generate(message);

          case 12:
            return _context.abrupt("break", 22);

          case 13:
            _context.next = 15;
            return reset(message);

          case 15:
            return _context.abrupt("break", 22);

          case 16:
            _context.next = 18;
            return logout(message);

          case 18:
            return _context.abrupt("break", 22);

          case 19:
            _context.next = 21;
            return get(message);

          case 21:
            return _context.abrupt("break", 22);

          case 22:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();