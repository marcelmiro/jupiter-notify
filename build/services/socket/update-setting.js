'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var _require = require('../../database/repositories/settings'),
    findSetting = _require.findSetting,
    updateSetting = _require.updateSetting;

var _require2 = require('../releases'),
    getRelease = _require2.getRelease;

module.exports = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var io, socket, name, value, _socket$request$role, _yield$getRelease;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            io = _ref.io, socket = _ref.socket, name = _ref.name, value = _ref.value;
            _context.prev = 1;

            if ((_socket$request$role = socket.request.role) === null || _socket$request$role === void 0 ? void 0 : _socket$request$role['edit_config']) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You don\'t have permission to update website\'s settings.'));

          case 4:
            _context.prev = 4;
            _context.next = 7;
            return Joi.object().keys({
              name: Joi.string().required(),
              value: Joi.string().required()
            }).required().validateAsync({
              name: name,
              value: value
            });

          case 7:
            _context.next = 12;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](4);
            return _context.abrupt("return", socket.emit('send-error', 'Parameter validation failed: ' + _context.t0.message));

          case 12:
            _context.next = 14;
            return findSetting(name);

          case 14:
            if (_context.sent) {
              _context.next = 16;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'Setting name doesn\'t exist.'));

          case 16:
            if (!(value === process.env[name])) {
              _context.next = 18;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'Setting already has the same value.'));

          case 18:
            _context.t1 = name.toLowerCase() === 'in_stock';

            if (!_context.t1) {
              _context.next = 32;
              break;
            }

            _context.next = 22;
            return getRelease();

          case 22:
            _context.t3 = _yield$getRelease = _context.sent;
            _context.t2 = _context.t3 === null;

            if (_context.t2) {
              _context.next = 26;
              break;
            }

            _context.t2 = _yield$getRelease === void 0;

          case 26:
            if (!_context.t2) {
              _context.next = 30;
              break;
            }

            _context.t4 = void 0;
            _context.next = 31;
            break;

          case 30:
            _context.t4 = _yield$getRelease.stock;

          case 31:
            _context.t1 = _context.t4;

          case 32:
            if (!_context.t1) {
              _context.next = 34;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'A release is running therefore you can\'t update this setting.'));

          case 34:
            _context.next = 36;
            return updateSetting(name, value);

          case 36:
            if (!_context.sent) {
              _context.next = 41;
              break;
            }

            console.log("User '".concat(socket.request.user.username, "' has updated '").concat(name, "' setting."));
            socket.emit('send-message', 'Setting value updated.');
            _context.next = 42;
            break;

          case 41:
            socket.emit('send-error', 'Couldn\'t update setting.');

          case 42:
            io.sockets.emit('get-settings');
            _context.next = 48;
            break;

          case 45:
            _context.prev = 45;
            _context.t5 = _context["catch"](1);
            console.error(_context.t5);

          case 48:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 45], [4, 9]]);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();