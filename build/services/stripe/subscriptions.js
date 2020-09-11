'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var stripe = require('../../config/stripe');

var _require = require('./customers'),
    findCustomer = _require.findCustomer;

var updateSubscription = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(id, data) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return Joi.object().keys({
              id: Joi.string().required(),
              data: Joi.object()
            }).required().validateAsync({
              id: id,
              data: data
            });

          case 3:
            _context.next = 8;
            break;

          case 5:
            _context.prev = 5;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return");

          case 8:
            _context.next = 10;
            return stripe.subscriptions.update(id, data);

          case 10:
            return _context.abrupt("return", _context.sent);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 5]]);
  }));

  return function updateSubscription(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var deleteSubscription = function () {
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
            return stripe.subscriptions.del(id);

          case 10:
            return _context2.abrupt("return", _context2.sent);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 5]]);
  }));

  return function deleteSubscription(_x3) {
    return _ref2.apply(this, arguments);
  };
}();

var transferSubscription = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(_ref3) {
    var customerId, date, currency, CUSTOMER, planId;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            customerId = _ref3.customerId, date = _ref3.date, currency = _ref3.currency;
            _context3.prev = 1;
            _context3.next = 4;
            return Joi.object().keys({
              customerId: Joi.string().required(),
              date: [Joi.string().alphanum().required(), Joi.number().required()],
              currency: Joi.string()
            }).required().validateAsync({
              customerId: customerId,
              date: date,
              currency: currency
            });

          case 4:
            _context3.next = 9;
            break;

          case 6:
            _context3.prev = 6;
            _context3.t0 = _context3["catch"](1);
            return _context3.abrupt("return");

          case 9:
            _context3.next = 11;
            return findCustomer(customerId);

          case 11:
            CUSTOMER = _context3.sent;

            if (CUSTOMER) {
              _context3.next = 14;
              break;
            }

            return _context3.abrupt("return");

          case 14:
            planId = process.env.STRIPE_PLAN;

            if (CUSTOMER.currency && process.env['STRIPE_PLAN_' + CUSTOMER.currency.toUpperCase()]) {
              planId = process.env['STRIPE_PLAN_' + CUSTOMER.currency.toUpperCase()];
            } else if (currency && process.env['STRIPE_PLAN_' + currency.toUpperCase()]) {
              planId = process.env['STRIPE_PLAN_' + currency.toUpperCase()];
            }

            _context3.next = 18;
            return stripe.subscriptions.create({
              customer: customerId,
              items: [{
                plan: planId
              }],
              billing_cycle_anchor: date,
              proration_behavior: 'none'
            });

          case 18:
            return _context3.abrupt("return", _context3.sent);

          case 19:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 6]]);
  }));

  return function transferSubscription(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

module.exports = {
  updateSubscription: updateSubscription,
  deleteSubscription: deleteSubscription,
  transferSubscription: transferSubscription
};