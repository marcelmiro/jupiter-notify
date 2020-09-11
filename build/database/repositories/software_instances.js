'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('uuid'),
    uuidValidate = _require.validate;

var client = require('../../config/database');

var findSoftwareInstance = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(instanceId) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (uuidValidate(instanceId)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return");

          case 2:
            _context.next = 4;
            return client.query('SELECT * FROM software_instances WHERE instance_id = $1 LIMIT 1', [instanceId]);

          case 4:
            return _context.abrupt("return", _context.sent.rows[0]);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function findSoftwareInstance(_x) {
    return _ref.apply(this, arguments);
  };
}();

var findSoftwareInstanceByAccessToken = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(_ref2) {
    var softwareId, accessToken;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            softwareId = _ref2.softwareId, accessToken = _ref2.accessToken;

            if (!(!uuidValidate(softwareId) || !uuidValidate(accessToken))) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return");

          case 3:
            _context2.next = 5;
            return client.query('SELECT * FROM software_instances WHERE software_id = $1 AND access_token = $2 LIMIT 1', [softwareId, accessToken]);

          case 5:
            return _context2.abrupt("return", _context2.sent.rows[0]);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function findSoftwareInstanceByAccessToken(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

var insertSoftwareInstance = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(_ref4) {
    var accessToken, softwareId, instanceId;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            accessToken = _ref4.accessToken, softwareId = _ref4.softwareId, instanceId = _ref4.instanceId;

            if (!(!uuidValidate(accessToken) || !uuidValidate(softwareId) || !uuidValidate(instanceId))) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return");

          case 3:
            _context3.next = 5;
            return client.query('INSERT INTO software_instances (access_token, software_id, instance_id) VALUES ($1, $2, $3)', [accessToken, softwareId, instanceId]);

          case 5:
            return _context3.abrupt("return", _context3.sent);

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function insertSoftwareInstance(_x3) {
    return _ref5.apply(this, arguments);
  };
}();

var deleteSoftwareInstances = function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(accessToken) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (uuidValidate(accessToken)) {
              _context4.next = 2;
              break;
            }

            return _context4.abrupt("return");

          case 2:
            _context4.next = 4;
            return client.query('DELETE FROM software_instances WHERE access_token = $1', [accessToken]);

          case 4:
            return _context4.abrupt("return", _context4.sent);

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function deleteSoftwareInstances(_x4) {
    return _ref6.apply(this, arguments);
  };
}();

module.exports = {
  findSoftwareInstance: findSoftwareInstance,
  findSoftwareInstanceByAccessToken: findSoftwareInstanceByAccessToken,
  insertSoftwareInstance: insertSoftwareInstance,
  deleteSoftwareInstances: deleteSoftwareInstances
};