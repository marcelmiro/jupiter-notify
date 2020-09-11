'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../config/cookies'),
    name = _require.name,
    keys = _require.keys;

var _require2 = require('../../database/repositories/users'),
    findUserByCookie = _require2.findUserByCookie;

var _require3 = require('../../database/repositories/user-roles'),
    findRoleFromUserRole = _require3.findRoleFromUserRole;

var session = require('cookie-session')({
  name: name,
  keys: keys
});

module.exports = function (io) {
  io.use(function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(socket, next) {
      var _req$session$passport;

      var req, USER, ROLE;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(socket.handshake.headers.referer && !socket.handshake.headers.referer.endsWith('/admin'))) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return");

            case 2:
              req = {
                headers: {
                  cookie: socket.handshake.headers.cookie
                }
              };
              session(req, {}, function () {});

              if (!((_req$session$passport = req.session.passport) === null || _req$session$passport === void 0 ? void 0 : _req$session$passport.user)) {
                _context.next = 10;
                break;
              }

              _context.next = 7;
              return findUserByCookie(req.session.passport.user);

            case 7:
              _context.t0 = _context.sent;
              _context.next = 11;
              break;

            case 10:
              _context.t0 = undefined;

            case 11:
              USER = _context.t0;

              if (!USER) {
                _context.next = 18;
                break;
              }

              _context.next = 15;
              return findRoleFromUserRole(USER.user_id);

            case 15:
              _context.t1 = _context.sent;
              _context.next = 19;
              break;

            case 18:
              _context.t1 = undefined;

            case 19:
              ROLE = _context.t1;

              if (ROLE === null || ROLE === void 0 ? void 0 : ROLE['admin_panel']) {
                socket.request.user = USER;
                socket.request.role = ROLE;
                next();
              }

            case 21:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};