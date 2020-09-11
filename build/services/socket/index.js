'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var auth = require('./auth');

module.exports = function (io) {
  auth(io);
  io.on('connection', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(socket) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              socket.on('get-member-list', function () {
                return require('./get-member-list')(socket);
              });
              socket.on('get-member-view', function (userId) {
                return require('./get-member-view')({
                  socket: socket,
                  userId: userId
                });
              });
              socket.on('get-member-edit', function (userId) {
                return require('./get-member-edit')({
                  socket: socket,
                  userId: userId
                });
              });
              socket.on('add-member', function (_ref2) {
                var userId = _ref2.userId,
                    role = _ref2.role;
                return require('./add-member')({
                  io: io,
                  socket: socket,
                  userId: userId,
                  role: role
                });
              });
              socket.on('delete-member', function (userId) {
                return require('./delete-member')({
                  io: io,
                  socket: socket,
                  userId: userId
                });
              });
              socket.on('update-member', function (_ref3) {
                var userId = _ref3.userId,
                    name = _ref3.name,
                    value = _ref3.value;
                return require('./update-member')({
                  io: io,
                  socket: socket,
                  userId: userId,
                  name: name,
                  value: value
                });
              });
              socket.on('get-release', function () {
                return require('./get-release')(socket);
              });
              socket.on('create-release', function (number) {
                return require('./create-release')({
                  io: io,
                  socket: socket,
                  number: number
                });
              });
              socket.on('delete-release', function () {
                return require('./delete-release')({
                  io: io,
                  socket: socket
                });
              });
              socket.on('get-logs', function () {
                return require('./get-logs')(socket);
              });
              socket.on('get-settings', function () {
                return require('./get-settings')(socket);
              });
              socket.on('update-setting', function (_ref4) {
                var name = _ref4.name,
                    value = _ref4.value;
                return require('./update-setting')({
                  io: io,
                  socket: socket,
                  name: name,
                  value: value
                });
              });

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
  var CONSOLE_LOG = console.log;

  console.log = function (msg) {
    CONSOLE_LOG(msg);
    io.sockets.emit('get-logs');
  };

  var CONSOLE_INFO = console.info;

  console.info = function (msg) {
    CONSOLE_INFO(msg);
    io.sockets.emit('get-logs');
  };

  var CONSOLE_WARN = console.warn;

  console.warn = function (msg) {
    CONSOLE_WARN(msg);
    io.sockets.emit('get-logs');
  };

  var CONSOLE_ERROR = console.error;

  console.error = function (msg) {
    CONSOLE_ERROR(msg);
    io.sockets.emit('get-logs');
  };

  var CONSOLE_FATAL = console.fatal;

  console.fatal = function (msg) {
    CONSOLE_FATAL(msg);
    io.sockets.emit('get-logs');
  };
};