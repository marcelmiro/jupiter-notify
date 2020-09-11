'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../database/repositories/roles'),
    listRoles = _require.listRoles,
    findRoleByName = _require.findRoleByName;

var _require2 = require('../database/repositories/user-roles'),
    findUserRole = _require2.findUserRole,
    findRoleFromUserRole = _require2.findRoleFromUserRole,
    insertUserRole = _require2.insertUserRole;

var _require3 = require('../services/users'),
    deleteUser = _require3.deleteUser;

var _require4 = require('../services/stripe'),
    findCustomer = _require4.findCustomer,
    findPaymentMethod = _require4.findPaymentMethod;

var _require5 = require('../services/discord/utils'),
    findDiscordUser = _require5.findDiscordUser,
    inviteDiscordUser = _require5.inviteDiscordUser,
    addDiscordRole = _require5.addDiscordRole;

var _require6 = require('../utils'),
    inStock = _require6.inStock,
    transformDate = _require6.transformDate;

var index = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var ROLE;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (!req.user) {
              _context.next = 7;
              break;
            }

            _context.next = 4;
            return findRoleFromUserRole(req.user.user_id);

          case 4:
            _context.t0 = _context.sent;
            _context.next = 8;
            break;

          case 7:
            _context.t0 = undefined;

          case 8:
            ROLE = _context.t0;
            _context.t1 = res;
            _context.next = 12;
            return inStock();

          case 12:
            _context.t2 = _context.sent;
            _context.t3 = Boolean(req.user);
            _context.t4 = Boolean(ROLE);
            _context.t5 = Boolean(ROLE === null || ROLE === void 0 ? void 0 : ROLE['admin_panel']);
            _context.t6 = {
              inStock: _context.t2,
              isUser: _context.t3,
              hasRole: _context.t4,
              isAdmin: _context.t5
            };

            _context.t1.render.call(_context.t1, 'index', _context.t6);

            _context.next = 23;
            break;

          case 20:
            _context.prev = 20;
            _context.t7 = _context["catch"](0);
            console.error(_context.t7);

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 20]]);
  }));

  return function index(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var dashboard = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
    var _ROLE, CUSTOMER, SUBSCRIPTION, ROLE, RENEWAL_ROLE, user, membershipDetails, paymentDetails, price, DEFAULT_PAYMENT, month, year;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (req.user) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return", res.redirect('/login?redirect=dashboard'));

          case 3:
            _context2.next = 5;
            return findCustomer(req.user.stripe_id);

          case 5:
            CUSTOMER = _context2.sent;

            if (CUSTOMER) {
              _context2.next = 8;
              break;
            }

            return _context2.abrupt("return", res.redirect('/logout'));

          case 8:
            SUBSCRIPTION = CUSTOMER.subscriptions.data[0];
            _context2.next = 11;
            return findRoleFromUserRole(req.user.user_id);

          case 11:
            ROLE = _context2.sent;

            if (ROLE) {
              _context2.next = 33;
              break;
            }

            if (SUBSCRIPTION) {
              _context2.next = 15;
              break;
            }

            return _context2.abrupt("return", res.redirect('/'));

          case 15:
            _context2.next = 17;
            return findRoleByName('renewal');

          case 17:
            RENEWAL_ROLE = _context2.sent;

            if (!(RENEWAL_ROLE === null || RENEWAL_ROLE === void 0 ? void 0 : RENEWAL_ROLE['role_id'])) {
              _context2.next = 30;
              break;
            }

            ROLE = RENEWAL_ROLE;
            _context2.next = 22;
            return insertUserRole(req.user.user_id, ROLE.role_id);

          case 22:
            if (!_context2.sent) {
              _context2.next = 27;
              break;
            }

            _context2.next = 25;
            return addDiscordRole(req.user.user_id, ROLE.role_id);

          case 25:
            _context2.next = 28;
            break;

          case 27:
            return _context2.abrupt("return", res.redirect('/'));

          case 28:
            _context2.next = 31;
            break;

          case 30:
            return _context2.abrupt("return", res.redirect('/'));

          case 31:
            _context2.next = 37;
            break;

          case 33:
            if (!(ROLE.name.toLowerCase() === 'renewal' && !SUBSCRIPTION)) {
              _context2.next = 37;
              break;
            }

            _context2.next = 36;
            return deleteUser(req.user.user_id);

          case 36:
            return _context2.abrupt("return", res.redirect('/'));

          case 37:
            _context2.t0 = req.user.username;
            _context2.t1 = req.user.avatar_url || 'https://cdn.discordapp.com/embed/avatars/1.png?size=2048';
            _context2.t2 = Boolean;
            _context2.next = 42;
            return findDiscordUser(req.user.user_id);

          case 42:
            _context2.t3 = _context2.sent;
            _context2.t4 = (0, _context2.t2)(_context2.t3);
            user = {
              username: _context2.t0,
              avatarUrl: _context2.t1,
              inServer: _context2.t4
            };
            membershipDetails = {
              subscription: false,
              cancelled: false,
              plan: undefined,
              price: undefined,
              dateNextPayment: undefined,
              dateCreated: undefined
            };
            paymentDetails = {
              name: undefined,
              last4: undefined,
              dateExpiry: undefined
            };

            if (!SUBSCRIPTION) {
              _context2.next = 78;
              break;
            }

            membershipDetails.subscription = true;
            membershipDetails.cancelled = Boolean(SUBSCRIPTION.cancel_at_period_end);
            membershipDetails.plan = SUBSCRIPTION.plan.interval === 'month' ? 'Monthly' : SUBSCRIPTION.plan.interval === 'week' ? 'Weekly' : SUBSCRIPTION.plan.interval === 'day' ? 'Daily' : SUBSCRIPTION.plan.interval;
            price = Math.round(SUBSCRIPTION.plan.amount) / 100;
            price = CUSTOMER.currency === 'eur' ? price + '€' : CUSTOMER.currency === 'usd' ? '$' + price : CUSTOMER.currency === 'gbp' ? '£' + price : price;
            membershipDetails.price = price;

            if (SUBSCRIPTION.cancel_at_period_end) {
              _context2.next = 60;
              break;
            }

            _context2.next = 57;
            return transformDate(new Date(SUBSCRIPTION.current_period_end * 1000));

          case 57:
            _context2.t5 = _context2.sent;
            _context2.next = 61;
            break;

          case 60:
            _context2.t5 = '-';

          case 61:
            membershipDetails.dateNextPayment = _context2.t5;
            _context2.next = 64;
            return transformDate(new Date(SUBSCRIPTION.created * 1000));

          case 64:
            membershipDetails.dateCreated = _context2.sent;

            if (!SUBSCRIPTION.default_payment_method) {
              _context2.next = 76;
              break;
            }

            _context2.next = 68;
            return findPaymentMethod(SUBSCRIPTION.default_payment_method);

          case 68:
            DEFAULT_PAYMENT = _context2.sent;
            paymentDetails.name = DEFAULT_PAYMENT.billing_details.name;
            paymentDetails.last4 = DEFAULT_PAYMENT.card.last4;
            month = DEFAULT_PAYMENT.card.exp_month.toString();
            month = month.length === 1 ? '0' + month : month;
            year = DEFAULT_PAYMENT.card.exp_year.toString();
            year = year.length === 4 ? year.slice(-2) : year;
            paymentDetails.dateExpiry = month + '/' + year;

          case 76:
            _context2.next = 94;
            break;

          case 78:
            if (!(ROLE.name.toLowerCase() !== 'renewal')) {
              _context2.next = 93;
              break;
            }

            membershipDetails.plan = ROLE.name;
            membershipDetails.price = 'Lifetime';
            membershipDetails.dateNextPayment = 'Never';

            if (!parseInt(req.user.created)) {
              _context2.next = 88;
              break;
            }

            _context2.next = 85;
            return transformDate(new Date(parseInt(req.user.created)));

          case 85:
            _context2.t6 = _context2.sent;
            _context2.next = 89;
            break;

          case 88:
            _context2.t6 = 'undefined';

          case 89:
            membershipDetails.dateCreated = _context2.t6;
            paymentDetails = undefined;
            _context2.next = 94;
            break;

          case 93:
            return _context2.abrupt("return", res.redirect('/'));

          case 94:
            res.render('dashboard', {
              user: user,
              isAdmin: Boolean((_ROLE = ROLE) === null || _ROLE === void 0 ? void 0 : _ROLE['admin_panel']),
              paymentDetails: paymentDetails,
              membershipDetails: membershipDetails
            });
            _context2.next = 101;
            break;

          case 97:
            _context2.prev = 97;
            _context2.t7 = _context2["catch"](0);
            console.error(_context2.t7);
            res.redirect('/');

          case 101:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 97]]);
  }));

  return function dashboard(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var admin = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res) {
    var role, roles;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;

            if (req.user) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return", res.redirect('/login?redirect=admin'));

          case 3:
            _context3.next = 5;
            return findRoleFromUserRole(req.user.user_id);

          case 5:
            role = _context3.sent;

            if (role === null || role === void 0 ? void 0 : role['admin_panel']) {
              _context3.next = 8;
              break;
            }

            return _context3.abrupt("return", res.redirect('/'));

          case 8:
            _context3.next = 10;
            return listRoles();

          case 10:
            roles = _context3.sent;

            if (roles) {
              roles.sort(function (a, b) {
                if (!a.importance) return 1;else if (!b.importance) return -1;else if (a.importance < b.importance) return -1;else if (a.importance > b.importance) return 1;
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;else if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                return 0;
              });
              roles = roles.map(function (role) {
                return role.name;
              });
            }

            res.render('admin', {
              role: role,
              roles: roles
            });
            _context3.next = 19;
            break;

          case 15:
            _context3.prev = 15;
            _context3.t0 = _context3["catch"](0);
            console.error(_context3.t0);
            res.redirect('/');

          case 19:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 15]]);
  }));

  return function admin(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

var join = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
    var INVITE;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;

            if (req.user) {
              _context4.next = 3;
              break;
            }

            return _context4.abrupt("return", res.redirect('/login?redirect=dashboard'));

          case 3:
            _context4.next = 5;
            return findUserRole(req.user.user_id);

          case 5:
            if (_context4.sent) {
              _context4.next = 7;
              break;
            }

            return _context4.abrupt("return", res.redirect('/'));

          case 7:
            _context4.next = 9;
            return inviteDiscordUser(req.user.user_id, req.user.username);

          case 9:
            INVITE = _context4.sent;
            INVITE ? res.redirect(INVITE) : res.send('<script>window.close();</script>');
            _context4.next = 17;
            break;

          case 13:
            _context4.prev = 13;
            _context4.t0 = _context4["catch"](0);
            console.error(_context4.t0);
            res.redirect('/dashboard');

          case 17:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 13]]);
  }));

  return function join(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

var terms = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(req, res) {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            try {
              res.render('terms');
            } catch (e) {
              console.error(e);
              res.redirect('/');
            }

          case 1:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function terms(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

module.exports = {
  index: index,
  dashboard: dashboard,
  admin: admin,
  join: join,
  terms: terms
};