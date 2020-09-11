'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var fs = require('fs');

var LOG_COLORS = {
  info: '#3FBF3F',
  warn: '#FFCC00',
  error: '#FF0000',
  fatal: '#9A63FF',
  "default": '#FFFFFF'
};

module.exports = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(socket) {
    var _socket$request$role, UNFILTERED_LOGS, TEMP_LOGS, LOGS;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if ((_socket$request$role = socket.request.role) === null || _socket$request$role === void 0 ? void 0 : _socket$request$role['view_console']) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You don\'t have permission to retrieve console logs.'));

          case 3:
            _context.next = 5;
            return new Promise(function (resolve, reject) {
              fs.readFile(process.env.LOGGER_NAME, 'utf8', function (err, data) {
                if (err) reject(err);
                resolve(data);
              });
            });

          case 5:
            UNFILTERED_LOGS = _context.sent;
            TEMP_LOGS = [];
            LOGS = UNFILTERED_LOGS.split(/\n(?=\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s)/);
            LOGS.forEach(function (log) {
              log = log.replace(/</g, '&lt;').replace(/>/g, '&gt;');
              log = log.replace(/\n/g, '<br>').replace(/\r/g, '');
              log = log.replace(/\s{4}/g, '&emsp;&emsp;');
              var TEMP = {
                time: log.split(' ', 2).join(' ')
              };
              TEMP.text = log.substr(TEMP.time.length).split(' ').filter(Boolean);
              TEMP.status = TEMP.text[0];
              TEMP.text = TEMP.text.slice(1).join(' ');
              TEMP.color = TEMP.status.toLowerCase() in LOG_COLORS ? LOG_COLORS[TEMP.status.toLowerCase()] : LOG_COLORS["default"] || '#FFFFFF';
              TEMP_LOGS.push(TEMP);
            });
            socket.emit('send-logs', TEMP_LOGS);
            _context.next = 15;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 12]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();