'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../database/repositories/users'),
    findUser = _require.findUser;

var _require2 = require('../../database/repositories/user-roles'),
    findRoleFromUserRole = _require2.findRoleFromUserRole;

var _require3 = require('../stripe'),
    findCustomer = _require3.findCustomer;

module.exports = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var socket, userId, _socket$request$role, USER, ROLE, CUSTOMER, SUBSCRIPTION, DATA, d1, d2;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            socket = _ref.socket, userId = _ref.userId;
            _context.prev = 1;

            if ((_socket$request$role = socket.request.role) === null || _socket$request$role === void 0 ? void 0 : _socket$request$role['view_members']) {
              _context.next = 5;
              break;
            }

            socket.emit('close-member-edit');
            return _context.abrupt("return", socket.emit('send-error', 'You don\'t have permission to edit a member\'s data.'));

          case 5:
            _context.next = 7;
            return findUser(userId);

          case 7:
            USER = _context.sent;

            if (USER) {
              _context.next = 10;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'User id doesn\'t exist in database.'));

          case 10:
            _context.next = 12;
            return findRoleFromUserRole(userId);

          case 12:
            ROLE = _context.sent;

            if (ROLE) {
              _context.next = 15;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'User doesn\'t have a role.'));

          case 15:
            _context.next = 17;
            return findCustomer(USER.stripe_id);

          case 17:
            CUSTOMER = _context.sent;

            if (CUSTOMER) {
              _context.next = 20;
              break;
            }

            return _context.abrupt("return", socket.emit('send-error', 'Couldn\'t find customer.'));

          case 20:
            SUBSCRIPTION = CUSTOMER.subscriptions.data[0];
            DATA = {
              userId: userId,
              username: USER.username,
              avatarUrl: USER.avatar_url || 'https://cdn.discordapp.com/embed/avatars/1.png?size=2048',
              stripeId: USER.stripe_id,
              role: ROLE.name
            };

            if (SUBSCRIPTION) {
              DATA.subscriptionCurrency = CUSTOMER.currency;
              DATA.subscriptionTrial = 0;

              if (SUBSCRIPTION.trial_end) {
                d1 = new Date();
                d2 = new Date(SUBSCRIPTION.trial_end * 1000);
                DATA.subscriptionTrial = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
              }
            }

            socket.emit('set-member-edit', DATA);
            _context.next = 29;
            break;

          case 26:
            _context.prev = 26;
            _context.t0 = _context["catch"](1);
            console.error(_context.t0);

          case 29:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 26]]);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();