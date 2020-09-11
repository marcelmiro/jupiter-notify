'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../../database/repositories/access_tokens'),
    findAccessToken = _require.findAccessToken;

var TOKEN_RETRIEVED = function TOKEN_RETRIEVED(token) {
  return {
    color: 16748288,
    description: "Please don't share this key with anyone.",
    fields: [{
      name: 'Key:',
      value: token
    }],
    footer: {
      icon_url: 'https://www.jupiternotify.com/assets/logo.png',
      text: 'Jupiter Notify'
    }
  };
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
            if (!ACCESS_TOKEN) embed = TOKEN_UNEXISTS;else if (ACCESS_TOKEN === null || ACCESS_TOKEN === void 0 ? void 0 : ACCESS_TOKEN['access_token']) embed = TOKEN_RETRIEVED(ACCESS_TOKEN.access_token);else embed = UNEXPECTED_ERROR;
            _context.next = 6;
            return message.author.send({
              embed: embed
            });

          case 6:
            return _context.abrupt("return", _context.sent);

          case 7:
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