'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../database/repositories/user-roles'),
    listRenewalUsers = _require.listRenewalUsers;

var _require2 = require('./'),
    findCustomer = _require2.findCustomer;

var _require3 = require('../users'),
    deleteUser = _require3.deleteUser;

module.exports = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
  var USERS, i, CUSTOMER, SUBSCRIPTION;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return listRenewalUsers();

        case 3:
          USERS = _context.sent;
          i = 0;

        case 5:
          if (!(i < USERS.length)) {
            _context.next = 21;
            break;
          }

          _context.next = 8;
          return findCustomer(USERS[i].stripe_id);

        case 8:
          CUSTOMER = _context.sent;

          if (CUSTOMER) {
            _context.next = 11;
            break;
          }

          return _context.abrupt("continue", 18);

        case 11:
          SUBSCRIPTION = CUSTOMER.subscriptions.data[0];

          if (SUBSCRIPTION) {
            _context.next = 18;
            break;
          }

          _context.next = 15;
          return deleteUser(USERS[i].user_id);

        case 15:
          if (_context.sent) {
            _context.next = 17;
            break;
          }

          return _context.abrupt("continue", 18);

        case 17:
          console.log("User '".concat(USERS[i].username, "' had renewal role without subscription. User's role has been removed."));

        case 18:
          i++;
          _context.next = 5;
          break;

        case 21:
          _context.next = 26;
          break;

        case 23:
          _context.prev = 23;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);

        case 26:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, null, [[0, 23]]);
}));