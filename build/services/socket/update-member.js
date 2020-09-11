'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var _require = require('../../database/repositories/users'),
    findUser = _require.findUser,
    findUserByStripe = _require.findUserByStripe,
    updateUser = _require.updateUser;

var _require2 = require('../../database/repositories/user-roles'),
    findRoleFromUserRole = _require2.findRoleFromUserRole,
    updateUserRole = _require2.updateUserRole;

var _require3 = require('../../database/repositories/roles'),
    findRoleByName = _require3.findRoleByName;

var _require4 = require('../stripe'),
    listCustomers = _require4.listCustomers,
    findCustomer = _require4.findCustomer,
    createCustomer = _require4.createCustomer,
    deleteCustomer = _require4.deleteCustomer,
    updateSubscription = _require4.updateSubscription,
    transferSubscription = _require4.transferSubscription;

var _require5 = require('../discord/utils'),
    addDiscordRole = _require5.addDiscordRole,
    deleteDiscordRoleByName = _require5.deleteDiscordRoleByName;

var updateRoleFunction = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var socket, user, role, ROLE;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            socket = _ref.socket, user = _ref.user, role = _ref.role;

            if (!(user.role.toLowerCase() === role.toLowerCase())) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You can\'t update to the same role.'));

          case 3:
            if (!(user.role.toLowerCase() === 'renewal')) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You can\'t change the renewal role.'));

          case 5:
            if (!(role.toLowerCase() === 'renewal')) {
              _context.next = 7;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'You can\'t add a member to the renewal role.'));

          case 7:
            _context.next = 9;
            return findRoleByName(role);

          case 9:
            ROLE = _context.sent;

            if (ROLE) {
              _context.next = 12;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'Role doesn\'t exist.'));

          case 12:
            _context.next = 14;
            return updateUserRole(user.user_id, ROLE.role_id);

          case 14:
            if (!_context.sent) {
              _context.next = 24;
              break;
            }

            _context.next = 17;
            return deleteDiscordRoleByName(user.user_id, user.role);

          case 17:
            if (!_context.sent) {
              _context.next = 20;
              break;
            }

            _context.next = 20;
            return addDiscordRole(user.user_id, ROLE.role_id);

          case 20:
            console.log("User '".concat(socket.request.user.username, "' changed '").concat(user.username, "' role to '").concat(role, "'."));
            socket.emit('send-message', "User '".concat(user.username, "' role changed to '").concat(role, "'."));
            _context.next = 25;
            break;

          case 24:
            socket.emit('send-error', 'Couldn\'t insert user role to database.');

          case 25:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function updateRoleFunction(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var updateUserFunction = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(_ref3) {
    var socket, user, name, value, CUSTOMERS;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            socket = _ref3.socket, user = _ref3.user, name = _ref3.name, value = _ref3.value;

            if (!(name === 'stripe_id')) {
              _context2.next = 13;
              break;
            }

            _context2.next = 4;
            return listCustomers();

          case 4:
            CUSTOMERS = _context2.sent;

            if (CUSTOMERS.find(function (CUSTOMER) {
              return CUSTOMER.id === value;
            })) {
              _context2.next = 7;
              break;
            }

            return _context2.abrupt("return", socket.emit('send-error', 'Stripe id doesn\'t exist.'));

          case 7:
            _context2.next = 9;
            return findUserByStripe(user.stripe_id);

          case 9:
            if (!_context2.sent) {
              _context2.next = 11;
              break;
            }

            return _context2.abrupt("return", socket.emit('send-error', 'Stripe id already assigned to a user.'));

          case 11:
            _context2.next = 22;
            break;

          case 13:
            if (!(name === 'email')) {
              _context2.next = 22;
              break;
            }

            _context2.prev = 14;
            _context2.next = 17;
            return Joi.string().email().required().validateAsync(value);

          case 17:
            _context2.next = 22;
            break;

          case 19:
            _context2.prev = 19;
            _context2.t0 = _context2["catch"](14);
            return _context2.abrupt("return", socket.emit('send-error', 'Parameter validation failed: ' + _context2.t0.message));

          case 22:
            if (!(user[name] === value)) {
              _context2.next = 24;
              break;
            }

            return _context2.abrupt("return", socket.emit('send-error', "You can't update ".concat(name, " to the same value.")));

          case 24:
            _context2.next = 26;
            return updateUser(user.user_id, name, value);

          case 26:
            if (!_context2.sent) {
              _context2.next = 31;
              break;
            }

            console.log("User '".concat(socket.request.user.username, "' changed '").concat(user.username, "'s ").concat(name, "."));
            socket.emit('send-message', "User '".concat(user.username, "'s ").concat(name, " has been updated."));
            _context2.next = 32;
            break;

          case 31:
            socket.emit('send-error', 'Couldn\'t update user data.');

          case 32:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[14, 19]]);
  }));

  return function updateUserFunction(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

var updateSubscriptionCurrencyFunction = function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(_ref5) {
    var _yield$createCustomer;

    var socket, user, value, CUSTOMER, SUBSCRIPTION, CUSTOMER_ID;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            socket = _ref5.socket, user = _ref5.user, value = _ref5.value;
            _context3.next = 3;
            return findCustomer(user.stripe_id);

          case 3:
            CUSTOMER = _context3.sent;
            SUBSCRIPTION = CUSTOMER === null || CUSTOMER === void 0 ? void 0 : CUSTOMER.subscriptions.data[0];

            if (SUBSCRIPTION) {
              _context3.next = 7;
              break;
            }

            return _context3.abrupt("return", socket.emit('send-error', 'User doesn\'t have a subscription.'));

          case 7:
            if (!(CUSTOMER.currency.toLowerCase() === value.toLowerCase())) {
              _context3.next = 9;
              break;
            }

            return _context3.abrupt("return", socket.emit('send-error', 'You can\'t update currency to the same value.'));

          case 9:
            if (process.env['STRIPE_PLAN_' + value.toUpperCase()]) {
              _context3.next = 11;
              break;
            }

            return _context3.abrupt("return", socket.emit('send-error', 'Currency plan doesn\'t exist.'));

          case 11:
            _context3.next = 13;
            return deleteCustomer(user.stripe_id);

          case 13:
            if (_context3.sent) {
              _context3.next = 15;
              break;
            }

            return _context3.abrupt("return", socket.emit('send-error', 'Error on deleting customer.'));

          case 15:
            _context3.next = 17;
            return createCustomer({
              userId: user.user_id,
              name: user.username,
              email: user.email
            });

          case 17:
            _context3.t1 = _yield$createCustomer = _context3.sent;
            _context3.t0 = _context3.t1 === null;

            if (_context3.t0) {
              _context3.next = 21;
              break;
            }

            _context3.t0 = _yield$createCustomer === void 0;

          case 21:
            if (!_context3.t0) {
              _context3.next = 25;
              break;
            }

            _context3.t2 = void 0;
            _context3.next = 26;
            break;

          case 25:
            _context3.t2 = _yield$createCustomer.id;

          case 26:
            CUSTOMER_ID = _context3.t2;

            if (CUSTOMER_ID) {
              _context3.next = 29;
              break;
            }

            return _context3.abrupt("return", socket.emit('send-error', 'Error on creating customer.'));

          case 29:
            _context3.next = 31;
            return updateUser(user.user_id, 'stripe_id', CUSTOMER_ID);

          case 31:
            if (_context3.sent) {
              _context3.next = 33;
              break;
            }

            return _context3.abrupt("return", socket.emit('send-error', 'Couldn\'t update stripe id in database.'));

          case 33:
            _context3.next = 35;
            return transferSubscription({
              customerId: CUSTOMER_ID,
              date: SUBSCRIPTION.current_period_end,
              currency: value.toUpperCase()
            });

          case 35:
            if (!_context3.sent) {
              _context3.next = 40;
              break;
            }

            console.log("User '".concat(socket.request.user.username, "' changed '").concat(user.username, "'s subscription currency to '").concat(value.toUpperCase(), "'"));
            socket.emit('send-message', "User '".concat(user.username, "'s subscription currency has been updated."));
            _context3.next = 41;
            break;

          case 40:
            socket.emit('send-error', 'Couldn\'t transfer subscription.');

          case 41:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function updateSubscriptionCurrencyFunction(_x3) {
    return _ref6.apply(this, arguments);
  };
}();

var updateTrialDaysFunction = function () {
  var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(_ref7) {
    var socket, user, value, DAYS, CUSTOMER, SUBSCRIPTION, DATE;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            socket = _ref7.socket, user = _ref7.user, value = _ref7.value;
            DAYS = Number(value);

            if (!(isNaN(DAYS) || DAYS % 1 !== 0)) {
              _context4.next = 4;
              break;
            }

            return _context4.abrupt("return", socket.emit('send-error', 'Input must be an integer.'));

          case 4:
            _context4.next = 6;
            return findCustomer(user.stripe_id);

          case 6:
            CUSTOMER = _context4.sent;
            SUBSCRIPTION = CUSTOMER === null || CUSTOMER === void 0 ? void 0 : CUSTOMER.subscriptions.data[0];

            if (SUBSCRIPTION) {
              _context4.next = 10;
              break;
            }

            return _context4.abrupt("return", socket.emit('send-error', 'User doesn\'t have a subscription.'));

          case 10:
            if (!(DAYS > 0)) {
              _context4.next = 23;
              break;
            }

            DATE = new Date();
            DATE.setDate(DATE.getDate() + DAYS);
            _context4.next = 15;
            return updateSubscription(SUBSCRIPTION.id, {
              proration_behavior: 'none',
              trial_end: Math.round(DATE.getTime() / 1000)
            });

          case 15:
            if (!_context4.sent) {
              _context4.next = 20;
              break;
            }

            console.log("User '".concat(socket.request.user.username, "' added ").concat(DAYS, " days to '").concat(user.username, "'s subscription."));
            socket.emit('send-message', "User '".concat(user.username, "'s subscription trial days added."));
            _context4.next = 21;
            break;

          case 20:
            socket.emit('send-error', 'Couldn\'t update subscription to add trial.');

          case 21:
            _context4.next = 35;
            break;

          case 23:
            if (SUBSCRIPTION.trial_end) {
              _context4.next = 27;
              break;
            }

            return _context4.abrupt("return", socket.emit('send-error', 'Subscription already doesn\'t have a trial.'));

          case 27:
            _context4.next = 29;
            return updateSubscription(SUBSCRIPTION.id, {
              proration_behavior: 'create_prorations',
              trial_end: 'now'
            });

          case 29:
            if (!_context4.sent) {
              _context4.next = 34;
              break;
            }

            console.log("User '".concat(socket.request.user.username, "' removed trial from '").concat(user.username, "'s subscription."));
            socket.emit('send-message', "User '".concat(user.username, "'s subscription trial days removed."));
            _context4.next = 35;
            break;

          case 34:
            socket.emit('send-error', 'Couldn\'t update subscription to remove trial.');

          case 35:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function updateTrialDaysFunction(_x4) {
    return _ref8.apply(this, arguments);
  };
}();

module.exports = function () {
  var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(_ref9) {
    var io, socket, userId, name, value, _socket$request$role, USER, ROLE, IMPORTANCE_ADMIN, IMPORTANCE_USER;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            io = _ref9.io, socket = _ref9.socket, userId = _ref9.userId, name = _ref9.name, value = _ref9.value;
            _context5.prev = 1;

            if ((_socket$request$role = socket.request.role) === null || _socket$request$role === void 0 ? void 0 : _socket$request$role['modify_members']) {
              _context5.next = 5;
              break;
            }

            socket.emit('close-member-edit');
            return _context5.abrupt("return", socket.emit('send-error', 'You don\'t have permission to update a member\'s data.'));

          case 5:
            _context5.prev = 5;
            _context5.next = 8;
            return Joi.object().keys({
              userId: Joi.string().alphanum().required(),
              name: Joi.string().required(),
              value: Joi.string().required()
            }).required().validateAsync({
              userId: userId,
              name: name,
              value: value.toString()
            });

          case 8:
            _context5.next = 13;
            break;

          case 10:
            _context5.prev = 10;
            _context5.t0 = _context5["catch"](5);
            return _context5.abrupt("return", socket.emit('send-error', 'Parameter validation failed: ' + _context5.t0.message));

          case 13:
            _context5.next = 15;
            return findUser(userId);

          case 15:
            USER = _context5.sent;

            if (USER) {
              _context5.next = 18;
              break;
            }

            return _context5.abrupt("return", socket.emit('send-error', 'User id doesn\'t exist in database.'));

          case 18:
            _context5.next = 20;
            return findRoleFromUserRole(userId);

          case 20:
            ROLE = _context5.sent;

            if (ROLE) {
              _context5.next = 23;
              break;
            }

            return _context5.abrupt("return", socket.emit('send-error', 'User doesn\'t have a role.'));

          case 23:
            IMPORTANCE_ADMIN = socket.request.role.importance;
            IMPORTANCE_USER = ROLE.importance || 10;

            if (!(IMPORTANCE_ADMIN > 2 && IMPORTANCE_ADMIN >= IMPORTANCE_USER || IMPORTANCE_ADMIN > IMPORTANCE_USER)) {
              _context5.next = 27;
              break;
            }

            return _context5.abrupt("return", socket.emit('send-error', "You don't have permission to update a user with '".concat(ROLE.name, "' role.")));

          case 27:
            _context5.t1 = name;
            _context5.next = _context5.t1 === 'role' ? 30 : _context5.t1 === 'email' ? 34 : _context5.t1 === 'stripeId' ? 37 : _context5.t1 === 'subscriptionCurrency' ? 40 : _context5.t1 === 'subscriptionTrial' ? 43 : 46;
            break;

          case 30:
            _context5.next = 32;
            return updateRoleFunction({
              socket: socket,
              user: _objectSpread(_objectSpread({}, USER), {}, {
                role: ROLE.name
              }),
              role: value
            });

          case 32:
            io.sockets.emit('get-member-list');
            return _context5.abrupt("break", 47);

          case 34:
            _context5.next = 36;
            return updateUserFunction({
              socket: socket,
              user: USER,
              name: name,
              value: value
            });

          case 36:
            return _context5.abrupt("break", 47);

          case 37:
            _context5.next = 39;
            return updateUserFunction({
              socket: socket,
              user: USER,
              name: 'stripe_id',
              value: value
            });

          case 39:
            return _context5.abrupt("break", 47);

          case 40:
            _context5.next = 42;
            return updateSubscriptionCurrencyFunction({
              socket: socket,
              user: USER,
              value: value
            });

          case 42:
            return _context5.abrupt("break", 47);

          case 43:
            _context5.next = 45;
            return updateTrialDaysFunction({
              socket: socket,
              user: USER,
              value: value
            });

          case 45:
            return _context5.abrupt("break", 47);

          case 46:
            socket.emit('send-error', 'Field name to update doesn\'t exist.');

          case 47:
            _context5.next = 52;
            break;

          case 49:
            _context5.prev = 49;
            _context5.t2 = _context5["catch"](1);
            console.error(_context5.t2);

          case 52:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[1, 49], [5, 10]]);
  }));

  return function (_x5) {
    return _ref10.apply(this, arguments);
  };
}();