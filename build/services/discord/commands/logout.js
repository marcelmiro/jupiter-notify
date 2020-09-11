'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../../database/repositories/access_tokens'),
    findAccessToken = _require.findAccessToken;

var _require2 = require('../../../database/repositories/software_instances'),
    deleteSoftwareInstances = _require2.deleteSoftwareInstances;

var TOKEN_LOGOUT = {
  color: 16748288,
  title: 'Your key has been logged out from all of our software.',
  footer: {
    icon_url: 'https://www.jupiternotify.com/assets/logo.png',
    text: 'Jupiter Notify'
  }
};
var TOKEN_UNEXISTS = {
  color: 16748288,
  title: 'No key was found bound to your account.',
  description: 'Type `!generate` to create one.',
  footer: {
    icon_url: 'https://www.jupiternotify.com/assets/logo.png',
    text: 'Jupiter Notify'
  }
};
var UNEXPECTED_ERROR = {
  color: 16748288,
  title: 'An unexpected error occurred.',
  description: 'Please message a member of staff if this message continues showing up.',
  footer: {
    icon_url: 'https://www.jupiternotify.com/assets/logo.png',
    text: 'Jupiter Notify'
  }
};

module.exports = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(message) {
    var embed, ACCESS_TOKEN;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return findAccessToken(message.author.id);

          case 2:
            ACCESS_TOKEN = _context.sent;

            if (ACCESS_TOKEN) {
              _context.next = 7;
              break;
            }

            embed = TOKEN_UNEXISTS;
            _context.next = 14;
            break;

          case 7:
            _context.next = 9;
            return deleteSoftwareInstances(ACCESS_TOKEN.access_token);

          case 9:
            if (!_context.sent) {
              _context.next = 13;
              break;
            }

            embed = TOKEN_LOGOUT;
            _context.next = 14;
            break;

          case 13:
            embed = UNEXPECTED_ERROR;

          case 14:
            _context.next = 16;
            return message.author.send({
              embed: embed
            });

          case 16:
            return _context.abrupt("return", _context.sent);

          case 17:
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