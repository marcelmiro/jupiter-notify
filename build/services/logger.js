'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var fs = require('fs');

var Joi = require('joi');

var validation = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return Joi.string().required().validateAsync(process.env.LOGGER_NAME);

          case 3:
            _context.next = 5;
            return Joi.number().required().validateAsync(process.env.LOGGER_MAX_SIZE);

          case 5:
            _context.next = 7;
            return Joi.number().required().validateAsync(process.env.LOGGER_NEW_LINES);

          case 7:
            _context.next = 12;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](0);
            console.fatal(_context.t0);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 9]]);
  }));

  return function validation() {
    return _ref.apply(this, arguments);
  };
}();

var clearLog = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var STATS, data, NEW_LINES;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return new Promise(function (resolve, reject) {
              fs.stat(process.env.LOGGER_NAME, function (err, stats) {
                if (err) reject(err);
                resolve(stats);
              });
            });

          case 3:
            STATS = _context2.sent;

            if (!(STATS.size <= parseInt(process.env.LOGGER_MAX_SIZE) * 1000)) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt("return");

          case 6:
            _context2.next = 8;
            return new Promise(function (resolve, reject) {
              fs.readFile(process.env.LOGGER_NAME, 'utf8', function (err, data) {
                if (err) reject(err);
                resolve(data);
              });
            });

          case 8:
            data = _context2.sent;
            NEW_LINES = parseInt(process.env.LOGGER_NEW_LINES);
            data = data.split('\n');
            data = data.length > NEW_LINES ? data.slice(data.length - NEW_LINES) : data.slice(data.length - data.length / 2);
            _context2.next = 14;
            return new Promise(function (resolve, reject) {
              fs.writeFile(process.env.LOGGER_NAME, data.join('\n'), function (err) {
                if (err) reject(err);
                resolve();
              });
            });

          case 14:
            _context2.next = 19;
            break;

          case 16:
            _context2.prev = 16;
            _context2.t0 = _context2["catch"](0);
            console.fatal(_context2.t0);

          case 19:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 16]]);
  }));

  return function clearLog() {
    return _ref2.apply(this, arguments);
  };
}();

var logMessage = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(loggerFunction, msg) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return clearLog();

          case 2:
            _context3.next = 4;
            return loggerFunction(msg instanceof Error ? msg.stack : msg);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function logMessage(_x, _x2) {
    return _ref3.apply(this, arguments);
  };
}();

validation().then(function () {
  var logger = require('simple-node-logger').createSimpleLogger({
    logFilePath: process.env.LOGGER_NAME,
    timestampFormat: 'YYYY-MM-DD HH:mm:ss'
  });

  console.log = function (msg) {
    logMessage(logger.info, msg).then()["catch"](console.fatal);
  };

  console.info = function (msg) {
    logMessage(logger.info, msg).then()["catch"](console.fatal);
  };

  console.warn = function (msg) {
    logMessage(logger.warn, msg).then()["catch"](console.fatal);
  };

  console.error = function (msg) {
    logMessage(logger.error, msg).then()["catch"](console.fatal);
  };

  console.fatal = function (msg) {
    logMessage(logger.fatal, msg).then(function () {
      return setTimeout(function () {
        return process.exit(1);
      }, 1000);
    })["catch"](process.exit(1));
  };

  console.log('Logger set up.');
});