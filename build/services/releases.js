'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var _require = require('../utils'),
    inStock = _require.inStock;

var getRelease = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var DATA;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            DATA = {};
            _context.next = 3;
            return inStock();

          case 3:
            _context.t1 = _context.sent;

            if (!_context.t1) {
              _context.next = 6;
              break;
            }

            _context.t1 = process.env.RELEASE_STOCK;

          case 6:
            _context.t0 = _context.t1;

            if (!_context.t0) {
              _context.next = 9;
              break;
            }

            _context.t0 = process.env.RELEASE_TOTAL_STOCK;

          case 9:
            if (!_context.t0) {
              _context.next = 12;
              break;
            }

            if (parseInt(process.env.RELEASE_STOCK)) DATA.stock = parseInt(process.env.RELEASE_STOCK);
            if (parseInt(process.env.RELEASE_STOCK)) DATA.total = parseInt(process.env.RELEASE_TOTAL_STOCK);

          case 12:
            return _context.abrupt("return", DATA);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getRelease() {
    return _ref.apply(this, arguments);
  };
}();

var createRelease = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(number) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return Joi.number().required().validateAsync(number);

          case 3:
            _context2.next = 8;
            break;

          case 5:
            _context2.prev = 5;
            _context2.t0 = _context2["catch"](0);
            return _context2.abrupt("return");

          case 8:
            process.env.IN_STOCK = 'true';
            process.env.RELEASE_STOCK = number.toString();
            process.env.RELEASE_TOTAL_STOCK = number.toString();
            return _context2.abrupt("return", number);

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 5]]);
  }));

  return function createRelease(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var deleteRelease = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            process.env.IN_STOCK = 'false';
            delete process.env.RELEASE_STOCK;
            delete process.env.RELEASE_TOTAL_STOCK;
            return _context3.abrupt("return", true);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function deleteRelease() {
    return _ref3.apply(this, arguments);
  };
}();

var useRelease = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
    var RELEASE;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return getRelease();

          case 2:
            RELEASE = _context4.sent;

            if (!(!RELEASE || RELEASE.stock <= 0)) {
              _context4.next = 7;
              break;
            }

            _context4.next = 6;
            return deleteRelease();

          case 6:
            return _context4.abrupt("return");

          case 7:
            RELEASE.stock -= 1;
            process.env.RELEASE_STOCK = RELEASE.stock.toString();

            if (!(RELEASE.stock === 0)) {
              _context4.next = 12;
              break;
            }

            _context4.next = 12;
            return deleteRelease();

          case 12:
            return _context4.abrupt("return", RELEASE);

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function useRelease() {
    return _ref4.apply(this, arguments);
  };
}();

module.exports = {
  getRelease: getRelease,
  createRelease: createRelease,
  deleteRelease: deleteRelease,
  useRelease: useRelease
};