'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../../database/repositories/access_tokens'),
    findAccessToken = _require.findAccessToken,
    insertAccessToken = _require.insertAccessToken,
    deleteAccessToken = _require.deleteAccessToken;

var _require2 = require('../../../database/repositories/software_instances'),
    deleteSoftwareInstances = _require2.deleteSoftwareInstances;

var TOKEN_CREATED = function TOKEN_CREATED(token) {
  return {
    color: 16748288,
    title: 'Your key has been resetted.',
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

var TOKEN_TIMEOUT = function TOKEN_TIMEOUT(time) {
  var timeText;

  if (time <= 60) {
    timeText = time === 1 ? '1 second' : time + ' seconds';
  } else {
    time = Math.round(time / 60);
    timeText = time === 1 ? '1 minute' : time + ' minutes';
  }

  return {
    color: 16748288,
    title: 'Sorry but your key is already pretty new.',
    description: "You will be able to generate a new one in ".concat(timeText, "."),
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
    var embed, ACCESS_TOKEN, ACCESS_TOKEN_TIMEOUT, ACCESS_TOKEN_DATE, RESPONSE;
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
            _context.next = 25;
            break;

          case 7:
            ACCESS_TOKEN_TIMEOUT = parseInt(process.env.ACCESS_TOKEN_TIMEOUT);
            ACCESS_TOKEN_DATE = parseInt(ACCESS_TOKEN.created) ? Math.round((Date.now() - new Date(parseInt(ACCESS_TOKEN.created))) / 1000) : undefined;

            if (!(ACCESS_TOKEN_TIMEOUT > ACCESS_TOKEN_DATE)) {
              _context.next = 13;
              break;
            }

            embed = TOKEN_TIMEOUT(ACCESS_TOKEN_TIMEOUT - ACCESS_TOKEN_DATE);
            _context.next = 25;
            break;

          case 13:
            _context.next = 15;
            return deleteAccessToken(message.author.id);

          case 15:
            if (!_context.sent) {
              _context.next = 24;
              break;
            }

            _context.next = 18;
            return deleteSoftwareInstances(ACCESS_TOKEN.access_token);

          case 18:
            _context.next = 20;
            return insertAccessToken(message.author.id);

          case 20:
            RESPONSE = _context.sent;
            embed = (RESPONSE === null || RESPONSE === void 0 ? void 0 : RESPONSE['access_token']) ? TOKEN_CREATED(RESPONSE.access_token) : UNEXPECTED_ERROR;
            _context.next = 25;
            break;

          case 24:
            embed = UNEXPECTED_ERROR;

          case 25:
            _context.next = 27;
            return message.author.send({
              embed: embed
            });

          case 27:
            return _context.abrupt("return", _context.sent);

          case 28:
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