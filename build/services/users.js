'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var _require = require('../database/repositories/users'),
    findUser = _require.findUser,
    insertUser = _require.insertUser,
    updateUser = _require.updateUser;

var _require2 = require('../database/repositories/user-roles'),
    findUserRole = _require2.findUserRole,
    deleteUserRole = _require2.deleteUserRole;

var _require3 = require('../database/repositories/access_tokens'),
    findAccessToken = _require3.findAccessToken,
    deleteAccessToken = _require3.deleteAccessToken;

var _require4 = require('../database/repositories/software_instances'),
    deleteSoftwareInstances = _require4.deleteSoftwareInstances;

var _require5 = require('./stripe'),
    listCustomers = _require5.listCustomers,
    findCustomer = _require5.findCustomer,
    createCustomer = _require5.createCustomer,
    updateCustomer = _require5.updateCustomer,
    deleteSubscription = _require5.deleteSubscription;

var _require6 = require('./discord/utils'),
    kickDiscordUser = _require6.kickDiscordUser;

var validation = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var userId, username, email, avatarUrl;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            userId = _ref.userId, username = _ref.username, email = _ref.email, avatarUrl = _ref.avatarUrl;
            _context.next = 3;
            return Joi.object().keys({
              userId: Joi.string().alphanum().required(),
              username: Joi.string().required(),
              email: Joi.string().email().required(),
              avatarUrl: Joi.string().required()
            }).required().validateAsync({
              userId: userId,
              username: username,
              email: email,
              avatarUrl: avatarUrl
            });

          case 3:
            return _context.abrupt("return", _context.sent);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function validation(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var checkCustomer = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(_ref3) {
    var dbUser, userId, username, email, DB_CUSTOMER, CUSTOMERS, CUSTOMER, _yield$createCustomer, STRIPE_ID;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            dbUser = _ref3.dbUser, userId = _ref3.userId, username = _ref3.username, email = _ref3.email;
            _context2.next = 3;
            return findCustomer(dbUser.stripe_id);

          case 3:
            DB_CUSTOMER = _context2.sent;

            if (!(DB_CUSTOMER && DB_CUSTOMER.description === userId)) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt("return", DB_CUSTOMER);

          case 6:
            _context2.next = 8;
            return listCustomers();

          case 8:
            CUSTOMERS = _context2.sent;
            CUSTOMER = CUSTOMERS.find(function (c) {
              return c.description === userId;
            });

            if (!CUSTOMER) {
              _context2.next = 17;
              break;
            }

            _context2.next = 13;
            return updateUser(userId, 'stripe_id', CUSTOMER.id);

          case 13:
            console.log("Stripe id for user '".concat(username, "' changed."));
            return _context2.abrupt("return", CUSTOMER.id);

          case 17:
            _context2.next = 19;
            return createCustomer({
              userId: userId,
              name: username,
              email: email
            });

          case 19:
            _context2.t1 = _yield$createCustomer = _context2.sent;
            _context2.t0 = _context2.t1 === null;

            if (_context2.t0) {
              _context2.next = 23;
              break;
            }

            _context2.t0 = _yield$createCustomer === void 0;

          case 23:
            if (!_context2.t0) {
              _context2.next = 27;
              break;
            }

            _context2.t2 = void 0;
            _context2.next = 28;
            break;

          case 27:
            _context2.t2 = _yield$createCustomer.id;

          case 28:
            STRIPE_ID = _context2.t2;

            if (STRIPE_ID) {
              _context2.next = 31;
              break;
            }

            throw new Error('Couldn\'t create new Stripe customer.');

          case 31:
            _context2.next = 33;
            return updateUser(userId, 'stripe_id', STRIPE_ID);

          case 33:
            console.log("Couldn't find customer linked to '".concat(username, "' so created new stripe customer."));
            return _context2.abrupt("return", STRIPE_ID);

          case 35:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function checkCustomer(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

var checkUserExists = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(userId) {
    var _yield$findUser;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.t0 = Boolean;
            _context3.next = 3;
            return findUser(userId);

          case 3:
            _context3.t2 = _yield$findUser = _context3.sent;
            _context3.t1 = _context3.t2 === null;

            if (_context3.t1) {
              _context3.next = 7;
              break;
            }

            _context3.t1 = _yield$findUser === void 0;

          case 7:
            if (!_context3.t1) {
              _context3.next = 11;
              break;
            }

            _context3.t3 = void 0;
            _context3.next = 12;
            break;

          case 11:
            _context3.t3 = _yield$findUser['user_id'];

          case 12:
            _context3.t4 = _context3.t3;
            return _context3.abrupt("return", (0, _context3.t0)(_context3.t4));

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function checkUserExists(_x3) {
    return _ref5.apply(this, arguments);
  };
}();

var checkDifferences = function () {
  var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(_ref6) {
    var userId, username, email, avatarUrl, dbUser, STRIPE_ID;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            userId = _ref6.userId, username = _ref6.username, email = _ref6.email, avatarUrl = _ref6.avatarUrl;
            _context4.next = 3;
            return findUser(userId);

          case 3:
            dbUser = _context4.sent;

            if (dbUser) {
              _context4.next = 6;
              break;
            }

            return _context4.abrupt("return");

          case 6:
            if (!(dbUser.username !== username)) {
              _context4.next = 13;
              break;
            }

            _context4.next = 9;
            return updateUser(userId, 'username', username);

          case 9:
            _context4.next = 11;
            return updateCustomer(dbUser.stripe_id, {
              name: username
            });

          case 11:
            dbUser.username = username;
            console.log("Username for user '".concat(username, "' changed."));

          case 13:
            if (!(dbUser.email !== email)) {
              _context4.next = 20;
              break;
            }

            _context4.next = 16;
            return updateUser(userId, 'email', email);

          case 16:
            _context4.next = 18;
            return updateCustomer(dbUser.stripe_id, {
              email: email
            });

          case 18:
            dbUser.email = email;
            console.log("Email for user '".concat(username, "' changed."));

          case 20:
            if (!(dbUser.avatar_url !== avatarUrl)) {
              _context4.next = 25;
              break;
            }

            _context4.next = 23;
            return updateUser(userId, 'avatar_url', avatarUrl);

          case 23:
            dbUser.avatar_url = avatarUrl;
            console.log("Avatar for user '".concat(username, "' changed."));

          case 25:
            _context4.next = 27;
            return checkCustomer({
              dbUser: dbUser,
              userId: userId,
              username: username,
              email: email
            });

          case 27:
            STRIPE_ID = _context4.sent;
            if (STRIPE_ID) dbUser.stripe_id = STRIPE_ID;
            return _context4.abrupt("return", dbUser);

          case 30:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function checkDifferences(_x4) {
    return _ref7.apply(this, arguments);
  };
}();

var createUser = function () {
  var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(_ref8) {
    var _yield$createCustomer2;

    var userId, username, email, avatarUrl, CUSTOMERS, CUSTOMER, stripeId, USER;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            userId = _ref8.userId, username = _ref8.username, email = _ref8.email, avatarUrl = _ref8.avatarUrl;
            _context5.next = 3;
            return listCustomers();

          case 3:
            CUSTOMERS = _context5.sent;
            CUSTOMER = CUSTOMERS.find(function (c) {
              return c.description === userId;
            });

            if (!CUSTOMER) {
              _context5.next = 9;
              break;
            }

            _context5.t0 = CUSTOMER.id;
            _context5.next = 21;
            break;

          case 9:
            _context5.next = 11;
            return createCustomer({
              userId: userId,
              name: username,
              email: email
            });

          case 11:
            _context5.t2 = _yield$createCustomer2 = _context5.sent;
            _context5.t1 = _context5.t2 === null;

            if (_context5.t1) {
              _context5.next = 15;
              break;
            }

            _context5.t1 = _yield$createCustomer2 === void 0;

          case 15:
            if (!_context5.t1) {
              _context5.next = 19;
              break;
            }

            _context5.t3 = void 0;
            _context5.next = 20;
            break;

          case 19:
            _context5.t3 = _yield$createCustomer2.id;

          case 20:
            _context5.t0 = _context5.t3;

          case 21:
            stripeId = _context5.t0;

            if (stripeId) {
              _context5.next = 24;
              break;
            }

            throw new Error('Couldn\'t create new Stripe customer.');

          case 24:
            _context5.next = 26;
            return insertUser({
              userId: userId,
              stripeId: stripeId,
              username: username,
              email: email,
              avatarUrl: avatarUrl
            });

          case 26:
            USER = _context5.sent;

            if (!USER) {
              _context5.next = 31;
              break;
            }

            return _context5.abrupt("return", USER);

          case 31:
            throw new Error('Couldn\'t insert user to database.');

          case 32:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function createUser(_x5) {
    return _ref9.apply(this, arguments);
  };
}();

var loginUser = function () {
  var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(_ref10) {
    var userId, username, email, avatarUrl, response;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            userId = _ref10.userId, username = _ref10.username, email = _ref10.email, avatarUrl = _ref10.avatarUrl;
            _context6.next = 3;
            return validation({
              userId: userId,
              username: username,
              email: email,
              avatarUrl: avatarUrl
            });

          case 3:
            if (_context6.sent) {
              _context6.next = 5;
              break;
            }

            return _context6.abrupt("return");

          case 5:
            _context6.next = 7;
            return checkUserExists(userId);

          case 7:
            if (!_context6.sent) {
              _context6.next = 14;
              break;
            }

            _context6.next = 10;
            return checkDifferences({
              userId: userId,
              username: username,
              email: email,
              avatarUrl: avatarUrl
            });

          case 10:
            response = _context6.sent;
            console.log("User '".concat(username, "' logged in."));
            _context6.next = 18;
            break;

          case 14:
            _context6.next = 16;
            return createUser({
              userId: userId,
              username: username,
              email: email,
              avatarUrl: avatarUrl
            });

          case 16:
            response = _context6.sent;
            console.log("User '".concat(username, "' inserted in db."));

          case 18:
            return _context6.abrupt("return", response);

          case 19:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function loginUser(_x6) {
    return _ref11.apply(this, arguments);
  };
}();

var deleteUser = function () {
  var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(id) {
    var USER, CUSTOMER, SUBSCRIPTION, RESPONSE, _yield$findAccessToke, ACCESS_TOKEN;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return Joi.string().alphanum().required().validateAsync(id);

          case 2:
            _context7.next = 4;
            return findUser(id);

          case 4:
            USER = _context7.sent;
            _context7.t0 = !USER;

            if (_context7.t0) {
              _context7.next = 10;
              break;
            }

            _context7.next = 9;
            return findUserRole(id);

          case 9:
            _context7.t0 = !_context7.sent;

          case 10:
            if (!_context7.t0) {
              _context7.next = 12;
              break;
            }

            return _context7.abrupt("return");

          case 12:
            _context7.next = 14;
            return findCustomer(USER.stripe_id);

          case 14:
            CUSTOMER = _context7.sent;
            SUBSCRIPTION = CUSTOMER === null || CUSTOMER === void 0 ? void 0 : CUSTOMER.subscriptions.data[0];

            if (!SUBSCRIPTION) {
              _context7.next = 19;
              break;
            }

            _context7.next = 19;
            return deleteSubscription(SUBSCRIPTION.id);

          case 19:
            _context7.next = 21;
            return deleteUserRole(id);

          case 21:
            RESPONSE = _context7.sent;

            if (!RESPONSE) {
              _context7.next = 42;
              break;
            }

            _context7.next = 25;
            return findAccessToken(id);

          case 25:
            _context7.t2 = _yield$findAccessToke = _context7.sent;
            _context7.t1 = _context7.t2 === null;

            if (_context7.t1) {
              _context7.next = 29;
              break;
            }

            _context7.t1 = _yield$findAccessToke === void 0;

          case 29:
            if (!_context7.t1) {
              _context7.next = 33;
              break;
            }

            _context7.t3 = void 0;
            _context7.next = 34;
            break;

          case 33:
            _context7.t3 = _yield$findAccessToke['access_token'];

          case 34:
            ACCESS_TOKEN = _context7.t3;

            if (!ACCESS_TOKEN) {
              _context7.next = 40;
              break;
            }

            _context7.next = 38;
            return deleteAccessToken(id);

          case 38:
            _context7.next = 40;
            return deleteSoftwareInstances(ACCESS_TOKEN);

          case 40:
            _context7.next = 42;
            return kickDiscordUser(id);

          case 42:
            return _context7.abrupt("return", RESPONSE);

          case 43:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function deleteUser(_x7) {
    return _ref12.apply(this, arguments);
  };
}();

module.exports = {
  loginUser: loginUser,
  deleteUser: deleteUser
};