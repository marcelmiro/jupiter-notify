'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var stripe = require('../../config/stripe');

var listCustomers = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return stripe.customers.list();

          case 2:
            return _context.abrupt("return", _context.sent.data);

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function listCustomers() {
    return _ref.apply(this, arguments);
  };
}();

var findCustomer = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(id) {
    var CUSTOMER;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return Joi.string().required().validateAsync(id);

          case 2:
            _context2.next = 4;
            return stripe.customers.retrieve(id, {
              expand: ['subscriptions']
            })["catch"](function () {
              return undefined;
            });

          case 4:
            CUSTOMER = _context2.sent;
            return _context2.abrupt("return", CUSTOMER && !CUSTOMER.deleted ? CUSTOMER : undefined);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function findCustomer(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var createCustomer = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(_ref3) {
    var description, name, email;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            description = _ref3.userId, name = _ref3.name, email = _ref3.email;
            _context3.prev = 1;
            _context3.next = 4;
            return Joi.object().keys({
              description: Joi.string().alphanum().required(),
              name: Joi.string().required(),
              email: Joi.string().email().required()
            }).required().validateAsync({
              description: description,
              name: name,
              email: email
            });

          case 4:
            _context3.next = 9;
            break;

          case 6:
            _context3.prev = 6;
            _context3.t0 = _context3["catch"](1);
            return _context3.abrupt("return");

          case 9:
            _context3.next = 11;
            return stripe.customers.create({
              description: description,
              name: name,
              email: email
            });

          case 11:
            return _context3.abrupt("return", _context3.sent);

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 6]]);
  }));

  return function createCustomer(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

var updateCustomer = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(id, data) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return Joi.object().keys({
              id: Joi.string().required(),
              data: Joi.object().required()
            }).required().validateAsync({
              id: id,
              data: data
            });

          case 3:
            _context4.next = 8;
            break;

          case 5:
            _context4.prev = 5;
            _context4.t0 = _context4["catch"](0);
            return _context4.abrupt("return");

          case 8:
            _context4.next = 10;
            return stripe.customers.update(id, data);

          case 10:
            return _context4.abrupt("return", _context4.sent);

          case 11:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 5]]);
  }));

  return function updateCustomer(_x3, _x4) {
    return _ref5.apply(this, arguments);
  };
}();

var deleteCustomer = function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(id) {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.next = 3;
            return Joi.string().required().validateAsync(id);

          case 3:
            _context5.next = 8;
            break;

          case 5:
            _context5.prev = 5;
            _context5.t0 = _context5["catch"](0);
            return _context5.abrupt("return");

          case 8:
            _context5.next = 10;
            return stripe.customers.del(id);

          case 10:
            return _context5.abrupt("return", _context5.sent);

          case 11:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 5]]);
  }));

  return function deleteCustomer(_x5) {
    return _ref6.apply(this, arguments);
  };
}();

module.exports = {
  listCustomers: listCustomers,
  findCustomer: findCustomer,
  createCustomer: createCustomer,
  updateCustomer: updateCustomer,
  deleteCustomer: deleteCustomer
};