'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var stripe = require('../../config/stripe');

var listPaymentMethods = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(customerId) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return Joi.string().required().validateAsync(customerId);

          case 3:
            _context.next = 8;
            break;

          case 5:
            _context.prev = 5;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return");

          case 8:
            _context.next = 10;
            return stripe.paymentMethods.list({
              customer: customerId,
              type: 'card'
            })["catch"](function () {
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

  return function listPaymentMethods(_x) {
    return _ref.apply(this, arguments);
  };
}();

var findPaymentMethod = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(id) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return Joi.string().required().validateAsync(id);

          case 3:
            _context2.next = 8;
            break;

          case 5:
            _context2.prev = 5;
            _context2.t0 = _context2["catch"](0);
            return _context2.abrupt("return");

          case 8:
            _context2.next = 10;
            return stripe.paymentMethods.retrieve(id)["catch"](function () {
              return undefined;
            });

          case 10:
            return _context2.abrupt("return", _context2.sent);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 5]]);
  }));

  return function findPaymentMethod(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var attachPaymentMethod = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(customerId, paymentMethodId) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return Joi.object().keys({
              customerId: Joi.string().required(),
              paymentMethodId: Joi.string().required()
            }).required().validateAsync({
              customerId: customerId,
              paymentMethodId: paymentMethodId
            });

          case 3:
            _context3.next = 8;
            break;

          case 5:
            _context3.prev = 5;
            _context3.t0 = _context3["catch"](0);
            return _context3.abrupt("return");

          case 8:
            _context3.next = 10;
            return stripe.paymentMethods.attach(paymentMethodId, {
              customer: customerId
            })["catch"](function () {
              return undefined;
            });

          case 10:
            return _context3.abrupt("return", _context3.sent);

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 5]]);
  }));

  return function attachPaymentMethod(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();

var detachPaymentMethod = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(id) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return Joi.string().required().validateAsync(id);

          case 3:
            _context4.next = 8;
            break;

          case 5:
            _context4.prev = 5;
            _context4.t0 = _context4["catch"](0);
            return _context4.abrupt("return");

          case 8:
            _context4.next = 10;
            return stripe.paymentMethods.detach(id)["catch"](function () {
              return undefined;
            });

          case 10:
            return _context4.abrupt("return", _context4.sent);

          case 11:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 5]]);
  }));

  return function detachPaymentMethod(_x5) {
    return _ref4.apply(this, arguments);
  };
}();

module.exports = {
  listPaymentMethods: listPaymentMethods,
  findPaymentMethod: findPaymentMethod,
  attachPaymentMethod: attachPaymentMethod,
  detachPaymentMethod: detachPaymentMethod
};