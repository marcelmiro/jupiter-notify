'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../../database/repositories/access_tokens'),
    findAccessToken = _require.findAccessToken,
    insertAccessToken = _require.insertAccessToken;

var TOKEN_CREATED = function TOKEN_CREATED(token) {
  return {
    color: 16748288,
    title: 'Your key has been generated.',
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

var TOKEN_EXISTS = {
  color: 16748288,
  title: 'You already have a key bound to your account.',
  description: 'Type `!get` to retrieve it.',
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
    var embed, RESPONSE;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return findAccessToken(message.author.id);

          case 2:
            if (!_context.sent) {
              _context.next = 6;
              break;
            }

            embed = TOKEN_EXISTS;
            _context.next = 10;
            break;

          case 6:
            _context.next = 8;
            return insertAccessToken(message.author.id);

          case 8:
            RESPONSE = _context.sent;
            embed = (RESPONSE === null || RESPONSE === void 0 ? void 0 : RESPONSE['access_token']) ? TOKEN_CREATED(RESPONSE.access_token) : UNEXPECTED_ERROR;

          case 10:
            _context.next = 12;
            return message.author.send({
              embed: embed
            });

          case 12:
            return _context.abrupt("return", _context.sent);

          case 13:
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