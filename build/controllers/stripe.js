'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var _require = require('../database/repositories/users'),
    findUser = _require.findUser,
    findUserByStripe = _require.findUserByStripe;

var _require2 = require('../database/repositories/user-roles'),
    findUserRole = _require2.findUserRole,
    findRoleFromUserRole = _require2.findRoleFromUserRole,
    insertUserRole = _require2.insertUserRole;

var _require3 = require('../database/repositories/roles'),
    findRoleByName = _require3.findRoleByName;

var _require4 = require('../services/users'),
    deleteUser = _require4.deleteUser;

var _require5 = require('../services/stripe'),
    findCustomer = _require5.findCustomer,
    updateCustomer = _require5.updateCustomer,
    updateSubscription = _require5.updateSubscription,
    transferSubscription = _require5.transferSubscription,
    attachPaymentMethod = _require5.attachPaymentMethod,
    createSubscriptionSession = _require5.createSubscriptionSession,
    createEditPaymentSession = _require5.createEditPaymentSession,
    findSetupIntent = _require5.findSetupIntent,
    createWebhook = _require5.createWebhook;

var _require6 = require('../services/discord/utils'),
    addDiscordRole = _require6.addDiscordRole;

var _require7 = require('../services/releases'),
    getRelease = _require7.getRelease,
    deleteRelease = _require7.deleteRelease,
    useRelease = _require7.useRelease;

var _require8 = require('../utils'),
    inStock = _require8.inStock,
    getDomain = _require8.getDomain;

var pay = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var _yield$getRelease, currency, redirect, CUSTOMER, SESSION;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            currency = req.query.currency;

            if (req.user) {
              _context.next = 6;
              break;
            }

            redirect = '/login?redirect=/stripe/pay';
            if (currency) redirect += '?currency=' + currency;
            return _context.abrupt("return", res.redirect(redirect));

          case 6:
            _context.next = 8;
            return inStock();

          case 8:
            if (_context.sent) {
              _context.next = 10;
              break;
            }

            return _context.abrupt("return", res.redirect('/'));

          case 10:
            _context.next = 12;
            return getRelease();

          case 12:
            _context.t1 = _yield$getRelease = _context.sent;
            _context.t0 = _context.t1 === null;

            if (_context.t0) {
              _context.next = 16;
              break;
            }

            _context.t0 = _yield$getRelease === void 0;

          case 16:
            if (!_context.t0) {
              _context.next = 20;
              break;
            }

            _context.t2 = void 0;
            _context.next = 21;
            break;

          case 20:
            _context.t2 = _yield$getRelease.stock;

          case 21:
            _context.t3 = _context.t2;

            if (!(_context.t3 <= 0)) {
              _context.next = 26;
              break;
            }

            _context.next = 25;
            return deleteRelease();

          case 25:
            return _context.abrupt("return", res.redirect('/'));

          case 26:
            _context.next = 28;
            return findUserRole(req.user.user_id);

          case 28:
            if (!_context.sent) {
              _context.next = 30;
              break;
            }

            return _context.abrupt("return", res.redirect('/dashboard'));

          case 30:
            _context.next = 32;
            return findCustomer(req.user.stripe_id);

          case 32:
            CUSTOMER = _context.sent;

            if (CUSTOMER) {
              _context.next = 35;
              break;
            }

            return _context.abrupt("return", res.redirect('/logout'));

          case 35:
            if (!CUSTOMER.subscriptions.data[0]) {
              _context.next = 37;
              break;
            }

            return _context.abrupt("return", res.redirect('/dashboard'));

          case 37:
            _context.t4 = createSubscriptionSession;
            _context.t5 = req.user.stripe_id;
            _context.t6 = currency;
            _context.next = 42;
            return getDomain(req);

          case 42:
            _context.t7 = _context.sent;
            _context.next = 45;
            return (0, _context.t4)(_context.t5, _context.t6, _context.t7);

          case 45:
            SESSION = _context.sent;

            if (SESSION) {
              res.send("\n                <script src=\"https://js.stripe.com/v3/\"></script>\n                <script type=\"text/javascript\">\n                    const stripe = Stripe('".concat(process.env.STRIPE_KEY, "')\n                    stripe.redirectToCheckout({ sessionId: '").concat(SESSION.id, "' })\n                        .then(r => { if (r.error.message) console.error(r.error.message) })\n                        .catch(e => console.error('Error when redirecting to pay membership: ' + e.message))\n                </script>\n            "));
            } else res.redirect('/');

            _context.next = 53;
            break;

          case 49:
            _context.prev = 49;
            _context.t8 = _context["catch"](0);
            console.error(_context.t8);
            res.redirect('/');

          case 53:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 49]]);
  }));

  return function pay(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var success = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            try {
              res.render('response', {
                status: 'payment-success'
              });
            } catch (e) {
              console.error(e);
              res.redirect('/');
            }

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function success(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var fail = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            try {
              res.render('response', {
                status: 'payment-fail'
              });
            } catch (e) {
              console.error(e);
              res.redirect('/');
            }

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function fail(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

var updatePayment = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
    var CUSTOMER, SESSION;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;

            if (!req.user) {
              _context4.next = 7;
              break;
            }

            _context4.next = 4;
            return findCustomer(req.user.stripe_id);

          case 4:
            _context4.t0 = _context4.sent;
            _context4.next = 8;
            break;

          case 7:
            _context4.t0 = undefined;

          case 8:
            CUSTOMER = _context4.t0;

            if (CUSTOMER) {
              _context4.next = 11;
              break;
            }

            return _context4.abrupt("return", res.redirect('/logout'));

          case 11:
            if (!CUSTOMER.subscriptions.data[0]) {
              _context4.next = 13;
              break;
            }

            return _context4.abrupt("return", res.redirect('/dashboard'));

          case 13:
            _context4.t1 = createEditPaymentSession;
            _context4.t2 = CUSTOMER.id;
            _context4.next = 17;
            return getDomain(req);

          case 17:
            _context4.t3 = _context4.sent;
            _context4.next = 20;
            return (0, _context4.t1)(_context4.t2, _context4.t3);

          case 20:
            SESSION = _context4.sent;

            if (SESSION) {
              res.send("\n                <script src=\"https://js.stripe.com/v3/\"></script>\n                <script type=\"text/javascript\">\n                    const stripe = Stripe('".concat(process.env.STRIPE_KEY, "')\n                    stripe.redirectToCheckout({ sessionId: '").concat(SESSION.id, "' })\n                        .then(r => { if (r.error.message) console.error(r.error.message) })\n                        .catch(e => console.error('Error when redirecting to update subscription payment: ' + e.message))\n                </script>\n            "));
            } else res.redirect('/dashboard');

            _context4.next = 28;
            break;

          case 24:
            _context4.prev = 24;
            _context4.t4 = _context4["catch"](0);
            console.error(_context4.t4);
            res.redirect('/dashboard');

          case 28:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 24]]);
  }));

  return function updatePayment(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

var cancelMembership = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(req, res) {
    var ROLE, response, CUSTOMER, SUBSCRIPTION;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;

            if (req.user) {
              _context5.next = 3;
              break;
            }

            return _context5.abrupt("return", res.redirect('/login?redirect=dashboard'));

          case 3:
            _context5.next = 5;
            return findRoleFromUserRole(req.user.user_id);

          case 5:
            ROLE = _context5.sent;

            if (ROLE) {
              _context5.next = 8;
              break;
            }

            return _context5.abrupt("return", res.redirect('/'));

          case 8:
            if (!(ROLE.name.toLowerCase() === 'renewal')) {
              _context5.next = 22;
              break;
            }

            _context5.next = 11;
            return findCustomer(req.user.stripe_id);

          case 11:
            CUSTOMER = _context5.sent;

            if (CUSTOMER) {
              _context5.next = 14;
              break;
            }

            return _context5.abrupt("return", res.redirect('/logout'));

          case 14:
            SUBSCRIPTION = CUSTOMER.subscriptions.data[0];

            if (!(!SUBSCRIPTION || SUBSCRIPTION.cancel_at_period_end)) {
              _context5.next = 17;
              break;
            }

            return _context5.abrupt("return", res.redirect('/dashboard'));

          case 17:
            _context5.next = 19;
            return updateSubscription(SUBSCRIPTION.id, {
              proration_behavior: 'none',
              cancel_at_period_end: true
            });

          case 19:
            response = _context5.sent;
            _context5.next = 25;
            break;

          case 22:
            _context5.next = 24;
            return deleteUser(req.user.user_id);

          case 24:
            response = _context5.sent;

          case 25:
            if (response) {
              _context5.next = 27;
              break;
            }

            return _context5.abrupt("return");

          case 27:
            console.log("User '".concat(req.user.username, "' has cancelled its '").concat(ROLE.name.toLowerCase(), "' license."));
            if (ROLE.name.toLowerCase() === 'renewal') res.redirect('/dashboard');else res.render('response', {
              status: 'cancel-role'
            });
            _context5.next = 35;
            break;

          case 31:
            _context5.prev = 31;
            _context5.t0 = _context5["catch"](0);
            console.error(_context5.t0);
            res.redirect('/dashboard');

          case 35:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 31]]);
  }));

  return function cancelMembership(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

var renewMembership = function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(req, res) {
    var ROLE, CUSTOMER, SUBSCRIPTION, RESPONSE;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;

            if (req.user) {
              _context6.next = 3;
              break;
            }

            return _context6.abrupt("return", res.redirect('/login?redirect=dashboard'));

          case 3:
            _context6.next = 5;
            return findRoleFromUserRole(req.user.user_id);

          case 5:
            ROLE = _context6.sent;

            if (ROLE) {
              _context6.next = 8;
              break;
            }

            return _context6.abrupt("return", res.redirect('/'));

          case 8:
            if (!(ROLE.name.toLowerCase() !== 'renewal')) {
              _context6.next = 10;
              break;
            }

            return _context6.abrupt("return", res.redirect('/dashboard'));

          case 10:
            _context6.next = 12;
            return findCustomer(req.user.stripe_id);

          case 12:
            CUSTOMER = _context6.sent;

            if (CUSTOMER) {
              _context6.next = 15;
              break;
            }

            return _context6.abrupt("return", res.redirect('/logout'));

          case 15:
            SUBSCRIPTION = CUSTOMER.subscriptions.data[0];

            if (SUBSCRIPTION === null || SUBSCRIPTION === void 0 ? void 0 : SUBSCRIPTION['cancel_at_period_end']) {
              _context6.next = 18;
              break;
            }

            return _context6.abrupt("return", res.redirect('/dashboard'));

          case 18:
            _context6.next = 20;
            return updateSubscription(SUBSCRIPTION.id, {
              cancel_at_period_end: false
            });

          case 20:
            RESPONSE = _context6.sent;

            if (RESPONSE) {
              _context6.next = 23;
              break;
            }

            return _context6.abrupt("return");

          case 23:
            console.log("User '".concat(req.user.username, "' has renewed its membership."));
            res.redirect('/dashboard');
            _context6.next = 31;
            break;

          case 27:
            _context6.prev = 27;
            _context6.t0 = _context6["catch"](0);
            console.error(_context6.t0);
            res.redirect('/dashboard');

          case 31:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[0, 27]]);
  }));

  return function renewMembership(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();

var transferMembership = function () {
  var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(req, res) {
    var ROLE, userId, USER, CUSTOMER, SUBSCRIPTION;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;

            if (req.user) {
              _context7.next = 3;
              break;
            }

            return _context7.abrupt("return", res.redirect('/login?redirect=dashboard'));

          case 3:
            _context7.next = 5;
            return findRoleFromUserRole(req.user.user_id);

          case 5:
            ROLE = _context7.sent;

            if (ROLE) {
              _context7.next = 8;
              break;
            }

            return _context7.abrupt("return", res.redirect('/'));

          case 8:
            if (['renewal', 'lifetime'].includes(ROLE.name.toLowerCase())) {
              _context7.next = 10;
              break;
            }

            return _context7.abrupt("return", res.render('response', {
              status: 'transfer-staff'
            }));

          case 10:
            userId = req.params.userId;
            _context7.prev = 11;
            _context7.next = 14;
            return Joi.number().required().validateAsync(userId);

          case 14:
            _context7.next = 19;
            break;

          case 16:
            _context7.prev = 16;
            _context7.t0 = _context7["catch"](11);
            return _context7.abrupt("return", res.render('response', {
              status: 'transfer-fail'
            }));

          case 19:
            _context7.next = 21;
            return findUser(userId);

          case 21:
            USER = _context7.sent;
            _context7.t1 = !USER;

            if (_context7.t1) {
              _context7.next = 27;
              break;
            }

            _context7.next = 26;
            return findUserRole(userId);

          case 26:
            _context7.t1 = _context7.sent;

          case 27:
            if (!_context7.t1) {
              _context7.next = 29;
              break;
            }

            return _context7.abrupt("return", res.render('response', {
              status: 'transfer-fail'
            }));

          case 29:
            if (!(ROLE.name.toLowerCase() === 'renewal')) {
              _context7.next = 42;
              break;
            }

            _context7.next = 32;
            return findCustomer(req.user.stripe_id);

          case 32:
            CUSTOMER = _context7.sent;

            if (CUSTOMER) {
              _context7.next = 35;
              break;
            }

            return _context7.abrupt("return", res.redirect('/logout'));

          case 35:
            SUBSCRIPTION = CUSTOMER.subscriptions.data[0];

            if (SUBSCRIPTION) {
              _context7.next = 38;
              break;
            }

            return _context7.abrupt("return", res.render('response', {
              status: 'transfer-fail'
            }));

          case 38:
            _context7.next = 40;
            return transferSubscription({
              customerId: USER.stripe_id,
              date: SUBSCRIPTION.current_period_end,
              currency: CUSTOMER.currency
            });

          case 40:
            if (_context7.sent) {
              _context7.next = 42;
              break;
            }

            return _context7.abrupt("return", res.render('response', {
              status: 'transfer-fail'
            }));

          case 42:
            _context7.next = 44;
            return insertUserRole(userId, ROLE.role_id);

          case 44:
            _context7.t2 = !_context7.sent;

            if (_context7.t2) {
              _context7.next = 49;
              break;
            }

            _context7.next = 48;
            return deleteUser(req.user.user_id);

          case 48:
            _context7.t2 = !_context7.sent;

          case 49:
            if (!_context7.t2) {
              _context7.next = 51;
              break;
            }

            return _context7.abrupt("return", res.render('response', {
              status: 'transfer-fail'
            }));

          case 51:
            console.log("User '".concat(req.user.username, "' transferred its '").concat(ROLE.name, "' license to '").concat(USER.username, "'."));
            res.render('response', {
              status: 'transfer-success'
            });
            _context7.next = 59;
            break;

          case 55:
            _context7.prev = 55;
            _context7.t3 = _context7["catch"](0);
            console.error(_context7.t3);
            res.redirect('/dashboard');

          case 59:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[0, 55], [11, 16]]);
  }));

  return function transferMembership(_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}();

var webhook = function () {
  var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(req, res) {
    var _EVENT$data, EVENT, SESSION, USER, defaultPayment, CUSTOMER, SUBSCRIPTION, RENEWAL_ROLE, SETUP_INTENT, PAYMENT_METHOD;

    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            _context8.next = 3;
            return createWebhook(req.body, req.headers['stripe-signature']);

          case 3:
            EVENT = _context8.sent;
            SESSION = EVENT === null || EVENT === void 0 ? void 0 : (_EVENT$data = EVENT.data) === null || _EVENT$data === void 0 ? void 0 : _EVENT$data.object;

            if (!(SESSION === null || SESSION === void 0 ? void 0 : SESSION.customer)) {
              _context8.next = 11;
              break;
            }

            _context8.next = 8;
            return findUserByStripe(SESSION.customer);

          case 8:
            _context8.t0 = _context8.sent;
            _context8.next = 12;
            break;

          case 11:
            _context8.t0 = undefined;

          case 12:
            USER = _context8.t0;

            if (USER) {
              _context8.next = 15;
              break;
            }

            return _context8.abrupt("return", res.json({
              received: false
            }));

          case 15:
            if (!(EVENT.type === 'checkout.session.completed')) {
              _context8.next = 64;
              break;
            }

            _context8.next = 18;
            return findCustomer(USER.stripe_id);

          case 18:
            CUSTOMER = _context8.sent;
            SUBSCRIPTION = CUSTOMER === null || CUSTOMER === void 0 ? void 0 : CUSTOMER.subscriptions.data[0];

            if (SUBSCRIPTION) {
              _context8.next = 22;
              break;
            }

            return _context8.abrupt("return");

          case 22:
            if (!(SESSION.mode === 'subscription')) {
              _context8.next = 40;
              break;
            }

            defaultPayment = SUBSCRIPTION.default_payment_method;
            _context8.next = 26;
            return useRelease();

          case 26:
            _context8.next = 28;
            return findUserRole(USER.user_id);

          case 28:
            if (_context8.sent) {
              _context8.next = 37;
              break;
            }

            _context8.next = 31;
            return findRoleByName('renewal');

          case 31:
            RENEWAL_ROLE = _context8.sent;

            if (!RENEWAL_ROLE) {
              _context8.next = 37;
              break;
            }

            _context8.next = 35;
            return insertUserRole(USER.user_id, RENEWAL_ROLE.role_id);

          case 35:
            _context8.next = 37;
            return addDiscordRole(USER.user_id, RENEWAL_ROLE.role_id);

          case 37:
            console.log("User '".concat(USER.username, "' has bought a subscription."));
            _context8.next = 58;
            break;

          case 40:
            if (!(SESSION.mode === 'setup')) {
              _context8.next = 58;
              break;
            }

            if (!SUBSCRIPTION.cancel_at_period_end) {
              _context8.next = 44;
              break;
            }

            _context8.next = 44;
            return updateSubscription(SUBSCRIPTION.id, {
              cancel_at_period_end: false
            });

          case 44:
            _context8.next = 46;
            return findSetupIntent(SESSION.setup_intent);

          case 46:
            SETUP_INTENT = _context8.sent;

            if (!SETUP_INTENT) {
              _context8.next = 53;
              break;
            }

            _context8.next = 50;
            return attachPaymentMethod(CUSTOMER.id, SETUP_INTENT.payment_method);

          case 50:
            _context8.t1 = _context8.sent;
            _context8.next = 54;
            break;

          case 53:
            _context8.t1 = undefined;

          case 54:
            PAYMENT_METHOD = _context8.t1;

            if (PAYMENT_METHOD) {
              _context8.next = 57;
              break;
            }

            return _context8.abrupt("return");

          case 57:
            defaultPayment = PAYMENT_METHOD.id;

          case 58:
            _context8.next = 60;
            return updateCustomer(CUSTOMER.id, {
              invoice_settings: {
                default_payment_method: defaultPayment
              }
            });

          case 60:
            _context8.next = 62;
            return updateSubscription(SUBSCRIPTION.id, {
              default_payment_method: defaultPayment
            });

          case 62:
            _context8.next = 68;
            break;

          case 64:
            if (!(EVENT.type === 'customer.subscription.deleted')) {
              _context8.next = 68;
              break;
            }

            _context8.next = 67;
            return deleteUser(USER.user_id);

          case 67:
            console.log("User '".concat(USER.username, "' membership has been deleted."));

          case 68:
            res.json({
              received: true
            });
            _context8.next = 75;
            break;

          case 71:
            _context8.prev = 71;
            _context8.t2 = _context8["catch"](0);
            console.error(_context8.t2);
            res.sendStatus(400);

          case 75:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 71]]);
  }));

  return function webhook(_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}();

module.exports = {
  pay: pay,
  success: success,
  fail: fail,
  updatePayment: updatePayment,
  cancelMembership: cancelMembership,
  renewMembership: renewMembership,
  transferMembership: transferMembership,
  webhook: webhook
};