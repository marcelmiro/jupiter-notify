'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var _require = require('../releases'),
    getRelease = _require.getRelease,
    createRelease = _require.createRelease;

module.exports = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var io, socket, number, _socket$request$role, _yield$getRelease;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            io = _ref.io, socket = _ref.socket, number = _ref.number;
            _context.prev = 1;

            if ((_socket$request$role = socket.request.role) === null || _socket$request$role === void 0 ? void 0 : _socket$request$role['create_releases']) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You don\'t have permission to create releases.'));

          case 4:
            _context.prev = 4;
            _context.next = 7;
            return Joi.number().required().validateAsync(number);

          case 7:
            _context.next = 12;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](4);
            return _context.abrupt("return", socket.emit('send-error', 'Parameter validation failed: ' + _context.t0.message));

          case 12:
            _context.next = 14;
            return getRelease();

          case 14:
            _context.t2 = _yield$getRelease = _context.sent;
            _context.t1 = _context.t2 === null;

            if (_context.t1) {
              _context.next = 18;
              break;
            }

            _context.t1 = _yield$getRelease === void 0;

          case 18:
            if (!_context.t1) {
              _context.next = 22;
              break;
            }

            _context.t3 = void 0;
            _context.next = 23;
            break;

          case 22:
            _context.t3 = _yield$getRelease.stock;

          case 23:
            if (!_context.t3) {
              _context.next = 25;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'A release is already running. Stop it if you want to create a new one.'));

          case 25:
            if (!(parseInt(number) < 1)) {
              _context.next = 27;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'Amount of licenses released must be greater than 0.'));

          case 27:
            _context.next = 29;
            return createRelease(number);

          case 29:
            if (!_context.sent) {
              _context.next = 35;
              break;
            }

            console.log("User '".concat(socket.request.user.username, "' has released ").concat(number, " renewal license").concat(parseInt(number) > 1 ? 's' : '', "."));
            socket.emit('send-message', 'Stock released.');
            io.sockets.emit('get-release');
            _context.next = 36;
            break;

          case 35:
            socket.emit('send-error', 'Couldn\'t create release.');

          case 36:
            _context.next = 41;
            break;

          case 38:
            _context.prev = 38;
            _context.t4 = _context["catch"](1);
            console.error(_context.t4);

          case 41:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 38], [4, 9]]);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();