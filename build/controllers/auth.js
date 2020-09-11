'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var passport = require('passport');

var _require = require('../database/repositories/user-roles'),
    findUserRole = _require.findUserRole;

var login = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var redirect, returnTo, state;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            redirect = req.query.redirect;
            returnTo = redirect && (typeof redirect === 'string' || redirect instanceof String) ? redirect : undefined;

            if (!req.user) {
              _context.next = 9;
              break;
            }

            if (!returnTo) {
              _context.next = 8;
              break;
            }

            return _context.abrupt("return", res.redirect((returnTo.startsWith('http') || returnTo.startsWith('/') ? '' : '/') + returnTo));

          case 8:
            return _context.abrupt("return", res.redirect('/'));

          case 9:
            state = returnTo ? Buffer.from(JSON.stringify({
              returnTo: returnTo
            })).toString('base64') : undefined;
            passport.authenticate('discord', {
              scope: ['identify', 'email'],
              state: state
            })(req, res);
            _context.next = 17;
            break;

          case 13:
            _context.prev = 13;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0);
            res.redirect('/');

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 13]]);
  }));

  return function login(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var logout = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            try {
              req.logout();
              res.redirect('/');
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

  return function logout(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var loginRedirect = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res) {
    var _ref4, returnTo;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _ref4 = req.query.state ? JSON.parse(Buffer.from(req.query.state, 'base64').toString()) : {}, returnTo = _ref4.returnTo;

            if (req.user) {
              _context3.next = 6;
              break;
            }

            res.redirect('/');
            _context3.next = 17;
            break;

          case 6:
            if (!returnTo) {
              _context3.next = 10;
              break;
            }

            res.redirect((returnTo.startsWith('http') || returnTo.startsWith('/') ? '' : '/') + returnTo);
            _context3.next = 17;
            break;

          case 10:
            _context3.next = 12;
            return findUserRole(req.user.user_id);

          case 12:
            if (!_context3.sent) {
              _context3.next = 16;
              break;
            }

            res.redirect('/dashboard');
            _context3.next = 17;
            break;

          case 16:
            res.redirect('/');

          case 17:
            _context3.next = 23;
            break;

          case 19:
            _context3.prev = 19;
            _context3.t0 = _context3["catch"](0);
            console.error(_context3.t0);
            res.redirect('/');

          case 23:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 19]]);
  }));

  return function loginRedirect(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

module.exports = {
  login: login,
  logout: logout,
  loginRedirect: loginRedirect
};