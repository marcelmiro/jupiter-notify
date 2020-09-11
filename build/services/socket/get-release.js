'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../releases'),
    getRelease = _require.getRelease;

module.exports = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(socket) {
    var _socket$request$role;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if ((_socket$request$role = socket.request.role) === null || _socket$request$role === void 0 ? void 0 : _socket$request$role['create_releases']) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You don\'t have permission to retrieve release information.'));

          case 3:
            _context.t0 = socket;
            _context.next = 6;
            return getRelease();

          case 6:
            _context.t1 = _context.sent;

            _context.t0.emit.call(_context.t0, 'set-release', _context.t1);

            _context.next = 13;
            break;

          case 10:
            _context.prev = 10;
            _context.t2 = _context["catch"](0);
            console.error(_context.t2);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 10]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();