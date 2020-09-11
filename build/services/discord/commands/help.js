'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var embed = {
  color: 16748288,
  fields: [{
    name: 'Generate a key:',
    value: '`!generate`'
  }, {
    name: 'Re-generate a brand new key:',
    value: '`!reset`'
  }, {
    name: 'Log out from our software:',
    value: '`!logout`'
  }, {
    name: 'Retrieve your key:',
    value: '`!get`'
  }],
  footer: {
    icon_url: 'https://www.jupiternotify.com/assets/logo.png',
    text: 'Jupiter Notify'
  }
};

module.exports = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(message) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return message.author.send({
              embed: embed
            });

          case 2:
            return _context.abrupt("return", _context.sent);

          case 3:
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