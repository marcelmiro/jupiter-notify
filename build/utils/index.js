'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var browser = require('browser-detect');

var _require = require('../database/repositories/user-roles'),
    findUserRole = _require.findUserRole,
    findRoleFromUserRole = _require.findRoleFromUserRole;

var checkIEBrowser = function checkIEBrowser(req, res, next) {
  browser(req.headers['user-agent']).name === 'ie' ? res.render('ie') : next();
};

var ROUTES = {
  member: [],
  admin: ['vue.js', 'socket.io.js']
};

var verifyRoute = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res, next) {
    var ROLE;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (Object.values(ROUTES).flat().find(function (route) {
              return req.path.includes(route);
            })) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", next());

          case 3:
            if (req.user) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", res.redirect('/'));

          case 5:
            if (!ROUTES.member.find(function (route) {
              return req.path.includes(route);
            })) {
              _context.next = 12;
              break;
            }

            _context.next = 8;
            return findUserRole(req.user.user_id);

          case 8:
            if (!_context.sent) {
              _context.next = 10;
              break;
            }

            return _context.abrupt("return", next());

          case 10:
            _context.next = 18;
            break;

          case 12:
            if (!ROUTES.admin.find(function (route) {
              return req.path.includes(route);
            })) {
              _context.next = 18;
              break;
            }

            _context.next = 15;
            return findRoleFromUserRole(req.user.user_id);

          case 15:
            ROLE = _context.sent;

            if (!(ROLE === null || ROLE === void 0 ? void 0 : ROLE['admin_panel'])) {
              _context.next = 18;
              break;
            }

            return _context.abrupt("return", next());

          case 18:
            res.redirect('/');
            _context.next = 24;
            break;

          case 21:
            _context.prev = 21;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0);

          case 24:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 21]]);
  }));

  return function verifyRoute(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var transformDate = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(date) {
    var day, month, year;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return Joi.date().required().validateAsync(date);

          case 3:
            _context2.next = 8;
            break;

          case 5:
            _context2.prev = 5;
            _context2.t0 = _context2["catch"](0);
            return _context2.abrupt("return");

          case 8:
            day = date.getDate();
            day = day.toString().length === 1 ? '0' + day : day;
            month = date.getMonth() + 1;
            month = month.toString().length === 1 ? '0' + month : month;
            year = date.getFullYear();
            return _context2.abrupt("return", day + '/' + month + '/' + year);

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 5]]);
  }));

  return function transformDate(_x4) {
    return _ref2.apply(this, arguments);
  };
}();

var inStock = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt("return", Boolean(process.env.IN_STOCK.toLowerCase() === 'true'));

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function inStock() {
    return _ref3.apply(this, arguments);
  };
}();

var getDomain = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req) {
    var PROTOCOL, DOMAIN;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return Joi.object().required().validateAsync(req);

          case 3:
            _context4.next = 8;
            break;

          case 5:
            _context4.prev = 5;
            _context4.t0 = _context4["catch"](0);
            return _context4.abrupt("return");

          case 8:
            PROTOCOL = req.protocol;
            DOMAIN = req.get('host');

            if (!(!PROTOCOL || !DOMAIN)) {
              _context4.next = 12;
              break;
            }

            return _context4.abrupt("return");

          case 12:
            return _context4.abrupt("return", PROTOCOL + '://' + DOMAIN);

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 5]]);
  }));

  return function getDomain(_x5) {
    return _ref4.apply(this, arguments);
  };
}();

module.exports = {
  checkIEBrowser: checkIEBrowser,
  verifyRoute: verifyRoute,
  transformDate: transformDate,
  inStock: inStock,
  getDomain: getDomain
};