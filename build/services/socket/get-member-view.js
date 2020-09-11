'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../database/repositories/users'),
    findUser = _require.findUser;

var _require2 = require('../../database/repositories/user-roles'),
    findRoleFromUserRole = _require2.findRoleFromUserRole;

var _require3 = require('../stripe'),
    findCustomer = _require3.findCustomer,
    findInvoice = _require3.findInvoice,
    findNextInvoice = _require3.findNextInvoice;

var _require4 = require('../discord/utils'),
    findDiscordUser = _require4.findDiscordUser;

var _require5 = require('../../utils'),
    transformDate = _require5.transformDate;

module.exports = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var socket, userId, _socket$request$role, USER, ROLE, CUSTOMER, SUBSCRIPTION, DATA, _CUSTOMER$invoice_set, LAST_INVOICE, NEXT_INVOICE;

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

            socket.emit('close-member-view');
            return _context.abrupt("return", socket.emit('send-error', 'You don\'t have permission to retrieve a member\'s data.'));

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
            _context.t0 = userId;
            _context.t1 = USER.username;
            _context.t2 = USER.email;
            _context.t3 = USER.avatar_url || 'https://cdn.discordapp.com/embed/avatars/1.png?size=2048';
            _context.t4 = USER.stripe_id;
            _context.t5 = USER.cookie_id;

            if (!parseInt(USER.created)) {
              _context.next = 33;
              break;
            }

            _context.next = 30;
            return transformDate(new Date(parseInt(USER.created)));

          case 30:
            _context.t6 = _context.sent;
            _context.next = 34;
            break;

          case 33:
            _context.t6 = 'undefined';

          case 34:
            _context.t7 = _context.t6;
            _context.t8 = Boolean;
            _context.next = 38;
            return findDiscordUser(userId);

          case 38:
            _context.t9 = _context.sent;
            _context.t10 = (0, _context.t8)(_context.t9);
            _context.t11 = {
              userId: _context.t0,
              username: _context.t1,
              email: _context.t2,
              avatarUrl: _context.t3,
              stripeId: _context.t4,
              cookieId: _context.t5,
              dateCreated: _context.t7,
              inServer: _context.t10
            };
            _context.t12 = {
              name: ROLE.name,
              color: ROLE.color
            };
            DATA = {
              user: _context.t11,
              role: _context.t12
            };

            if (!SUBSCRIPTION) {
              _context.next = 69;
              break;
            }

            DATA.subscription = {
              id: SUBSCRIPTION.id,
              status: SUBSCRIPTION.cancel_at_period_end ? 'cancelled' : SUBSCRIPTION.status,
              hasDefaultPayment: Boolean((_CUSTOMER$invoice_set = CUSTOMER.invoice_settings) === null || _CUSTOMER$invoice_set === void 0 ? void 0 : _CUSTOMER$invoice_set['default_payment_method'])
            };

            if (!SUBSCRIPTION.latest_invoice) {
              _context.next = 51;
              break;
            }

            _context.next = 48;
            return findInvoice(SUBSCRIPTION.latest_invoice);

          case 48:
            _context.t13 = _context.sent;
            _context.next = 52;
            break;

          case 51:
            _context.t13 = undefined;

          case 52:
            LAST_INVOICE = _context.t13;

            if (!LAST_INVOICE) {
              _context.next = 60;
              break;
            }

            _context.t14 = LAST_INVOICE.id;
            _context.t15 = LAST_INVOICE.status;
            _context.next = 58;
            return transformDate(new Date(LAST_INVOICE.created * 1000));

          case 58:
            _context.t16 = _context.sent;
            DATA.subscription.lastInvoice = {
              id: _context.t14,
              status: _context.t15,
              date: _context.t16
            };

          case 60:
            _context.next = 62;
            return findNextInvoice(USER.stripe_id);

          case 62:
            NEXT_INVOICE = _context.sent;

            if (!((NEXT_INVOICE === null || NEXT_INVOICE === void 0 ? void 0 : NEXT_INVOICE.subscription) === SUBSCRIPTION.id)) {
              _context.next = 69;
              break;
            }

            _context.t17 = NEXT_INVOICE.status;
            _context.next = 67;
            return transformDate(new Date(NEXT_INVOICE.created * 1000));

          case 67:
            _context.t18 = _context.sent;
            DATA.subscription.nextInvoice = {
              status: _context.t17,
              date: _context.t18
            };

          case 69:
            socket.emit('set-member-view', DATA);
            _context.next = 75;
            break;

          case 72:
            _context.prev = 72;
            _context.t19 = _context["catch"](1);
            console.error(_context.t19);

          case 75:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 72]]);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();