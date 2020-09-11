'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var stripe = require('../../config/stripe');

var _require = require('./customers'),
    findCustomer = _require.findCustomer,
    createCustomer = _require.createCustomer,
    deleteCustomer = _require.deleteCustomer;

var _require2 = require('../../database/repositories/users'),
    updateUser = _require2.updateUser;

var createSubscriptionSession = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(customerId, currency, url) {
    var CUSTOMER, planId, _yield$createCustomer;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return Joi.object().keys({
              customerId: Joi.string().required(),
              currency: Joi.string(),
              url: Joi.string().required()
            }).required().validateAsync({
              customerId: customerId,
              currency: currency,
              url: url
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
            return findCustomer(customerId);

          case 10:
            CUSTOMER = _context.sent;

            if (CUSTOMER) {
              _context.next = 13;
              break;
            }

            return _context.abrupt("return");

          case 13:
            CUSTOMER.currency = CUSTOMER.currency && process.env['STRIPE_PLAN_' + CUSTOMER.currency.toUpperCase()] ? CUSTOMER.currency : undefined;
            currency = currency && process.env['STRIPE_PLAN_' + currency.toUpperCase()] ? currency : undefined;

            if (!(CUSTOMER.currency && currency)) {
              _context.next = 38;
              break;
            }

            if (!(CUSTOMER.currency !== currency)) {
              _context.next = 35;
              break;
            }

            _context.next = 19;
            return deleteCustomer(customerId);

          case 19:
            _context.next = 21;
            return createCustomer({
              userId: CUSTOMER.description,
              name: CUSTOMER.name,
              email: CUSTOMER.email
            });

          case 21:
            _context.t2 = _yield$createCustomer = _context.sent;
            _context.t1 = _context.t2 === null;

            if (_context.t1) {
              _context.next = 25;
              break;
            }

            _context.t1 = _yield$createCustomer === void 0;

          case 25:
            if (!_context.t1) {
              _context.next = 29;
              break;
            }

            _context.t3 = void 0;
            _context.next = 30;
            break;

          case 29:
            _context.t3 = _yield$createCustomer.id;

          case 30:
            customerId = _context.t3;

            if (customerId) {
              _context.next = 33;
              break;
            }

            throw new Error('Couldn\'t create new Stripe customer.');

          case 33:
            _context.next = 35;
            return updateUser(CUSTOMER.description, 'stripe_id', customerId);

          case 35:
            planId = process.env['STRIPE_PLAN_' + currency.toUpperCase()];
            _context.next = 39;
            break;

          case 38:
            if (CUSTOMER.currency) planId = process.env['STRIPE_PLAN_' + CUSTOMER.currency.toUpperCase()];else if (currency) planId = process.env['STRIPE_PLAN_' + currency.toUpperCase()];else planId = process.env.STRIPE_PLAN;

          case 39:
            _context.next = 41;
            return stripe.checkout.sessions.create({
              mode: 'subscription',
              payment_method_types: ['card'],
              customer: customerId,
              subscription_data: {
                items: [{
                  plan: planId
                }]
              },
              success_url: url + '/stripe/success?session_id={CHECKOUT_SESSION_ID}',
              cancel_url: url
            })["catch"](function () {
              return undefined;
            });

          case 41:
            return _context.abrupt("return", _context.sent);

          case 42:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 5]]);
  }));

  return function createSubscriptionSession(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var createEditPaymentSession = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(customerId, url) {
    var CUSTOMER, SUBSCRIPTION;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return Joi.object().keys({
              customerId: Joi.string().required(),
              url: Joi.string().required()
            }).required().validateAsync({
              customerId: customerId,
              url: url
            });

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
            return stripe.checkout.sessions.create({
              mode: 'setup',
              payment_method_types: ['card'],
              customer: customerId,
              setup_intent_data: {
                metadata: {
                  customer_id: customerId,
                  subscription_id: SUBSCRIPTION.id
                }
              },
              success_url: url + '/dashboard',
              cancel_url: url + '/dashboard'
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

  return function createEditPaymentSession(_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

module.exports = {
  createSubscriptionSession: createSubscriptionSession,
  createEditPaymentSession: createEditPaymentSession
};