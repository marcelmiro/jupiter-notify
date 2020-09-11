'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var stripe = require('../../config/stripe');

var _require = require('./customers'),
    findCustomer = _require.findCustomer;

var findInvoice = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(id) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return Joi.string().required().validateAsync(id);

          case 3:
            _context.next = 8;
            break;

          case 5:
            _context.prev = 5;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return");

          case 8:
            _context.next = 10;
            return stripe.invoices.retrieve(id)["catch"](function () {
              return undefined;
            });

          case 10:
            return _context.abrupt("return", _context.sent);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 5]]);
  }));

  return function findInvoice(_x) {
    return _ref.apply(this, arguments);
  };
}();

var findNextInvoice = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(customerId) {
    var CUSTOMER, SUBSCRIPTION;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return Joi.string().required().validateAsync(customerId);

          case 3:
            _context2.next = 8;
            break;

          case 5:
            _context2.prev = 5;
            _context2.t0 = _context2["catch"](0);
            return _context2.abrupt("return");

          case 8:
            _context2.next = 10;
            return findCustomer(customerId);

          case 10:
            CUSTOMER = _context2.sent;
            SUBSCRIPTION = CUSTOMER === null || CUSTOMER === void 0 ? void 0 : CUSTOMER.subscriptions.data[0];

            if (SUBSCRIPTION) {
              _context2.next = 14;
              break;
            }

            return _context2.abrupt("return");

          case 14:
            _context2.next = 16;
            return stripe.invoices.retrieveUpcoming({
              customer: customerId,
              subscription: SUBSCRIPTION.id
            })["catch"](function () {
              return undefined;
            });

          case 16:
            return _context2.abrupt("return", _context2.sent);

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 5]]);
  }));

  return function findNextInvoice(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

module.exports = {
  findInvoice: findInvoice,
  findNextInvoice: findNextInvoice
};