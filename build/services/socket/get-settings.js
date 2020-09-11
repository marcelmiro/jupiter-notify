'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../database/repositories/settings'),
    listSettings = _require.listSettings;

module.exports = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(socket) {
    var _socket$request$role, SETTINGS, DB_SETTINGS;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if ((_socket$request$role = socket.request.role) === null || _socket$request$role === void 0 ? void 0 : _socket$request$role['edit_config']) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You don\'t have permission to retrieve website\'s settings.'));

          case 3:
            SETTINGS = {};
            _context.next = 6;
            return listSettings();

          case 6:
            DB_SETTINGS = _context.sent;
            DB_SETTINGS.forEach(function (_ref2) {
              var name = _ref2.name,
                  value = _ref2.value;
              SETTINGS[name] = value;
            });
            socket.emit('set-settings', SETTINGS);
            _context.next = 14;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0);

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 11]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();