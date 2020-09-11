'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var client = require('../../config/database');

var model = require('../models/software_ids');

var findSoftwareId = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(id) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return model.softwareId.validateAsync(id);

          case 2:
            _context.next = 4;
            return client.query('SELECT * FROM software_ids WHERE software_id = $1 LIMIT 1', [id]);

          case 4:
            return _context.abrupt("return", _context.sent.rows[0]);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function findSoftwareId(_x) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = {
  findSoftwareId: findSoftwareId
};