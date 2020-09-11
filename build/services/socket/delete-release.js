'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../releases'),
    getRelease = _require.getRelease,
    deleteRelease = _require.deleteRelease;

module.exports = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var io, socket, _socket$request$role, _yield$getRelease;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            io = _ref.io, socket = _ref.socket;
            _context.prev = 1;

            if ((_socket$request$role = socket.request.role) === null || _socket$request$role === void 0 ? void 0 : _socket$request$role['create_releases']) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You don\'t have permission to delete a release.'));

          case 4:
            _context.next = 6;
            return getRelease();

          case 6:
            _context.t1 = _yield$getRelease = _context.sent;
            _context.t0 = _context.t1 === null;

            if (_context.t0) {
              _context.next = 10;
              break;
            }

            _context.t0 = _yield$getRelease === void 0;

          case 10:
            if (!_context.t0) {
              _context.next = 14;
              break;
            }

            _context.t2 = void 0;
            _context.next = 15;
            break;

          case 14:
            _context.t2 = _yield$getRelease.stock;

          case 15:
            if (_context.t2) {
              _context.next = 17;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'Release doesn\'t exist.'));

          case 17:
            _context.next = 19;
            return deleteRelease();

          case 19:
            if (!_context.sent) {
              _context.next = 25;
              break;
            }

            console.log("User '".concat(socket.request.user.username, "' has stopped release."));
            socket.emit('send-message', 'Release has been stopped.');
            io.sockets.emit('get-release');
            _context.next = 26;
            break;

          case 25:
            socket.emit('send-error', 'Couldn\'t delete release.');

          case 26:
            _context.next = 31;
            break;

          case 28:
            _context.prev = 28;
            _context.t3 = _context["catch"](1);
            console.error(_context.t3);

          case 31:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 28]]);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();