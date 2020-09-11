'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('uuid'),
    uuidValidate = _require.validate;

var _require2 = require('../database/repositories/access_tokens'),
    findAccessTokenByToken = _require2.findAccessTokenByToken;

var _require3 = require('../database/repositories/software_ids'),
    findSoftwareId = _require3.findSoftwareId;

var _require4 = require('../database/repositories/software_instances'),
    findSoftwareInstance = _require4.findSoftwareInstance;

var _require5 = require('../utils/encryption'),
    decrypt = _require5.decrypt;

var authenticate = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var path, accessToken, softwareToken, ACCESS_TOKEN_OBJECT, iv, DECRYPTED_SOFTWARE_TOKEN, softwareId, instanceId, SOFTWARE_ID_OBJECT, PATH_SOFTWARE_NAME, SOFTWARE_INSTANCE_OBJECT;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            path = _ref.path, accessToken = _ref.accessToken, softwareToken = _ref.softwareToken;

            if (!(!uuidValidate(accessToken) || typeof softwareToken !== 'string' || typeof path !== 'string')) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return");

          case 3:
            _context.next = 5;
            return findAccessTokenByToken(accessToken);

          case 5:
            ACCESS_TOKEN_OBJECT = _context.sent;

            if (ACCESS_TOKEN_OBJECT) {
              _context.next = 8;
              break;
            }

            return _context.abrupt("return");

          case 8:
            iv = ACCESS_TOKEN_OBJECT.iv;
            _context.t0 = JSON;
            _context.next = 12;
            return decrypt({
              iv: iv,
              text: softwareToken
            });

          case 12:
            _context.t1 = _context.sent;
            DECRYPTED_SOFTWARE_TOKEN = _context.t0.parse.call(_context.t0, _context.t1);

            if (DECRYPTED_SOFTWARE_TOKEN) {
              _context.next = 16;
              break;
            }

            return _context.abrupt("return");

          case 16:
            softwareId = DECRYPTED_SOFTWARE_TOKEN.softwareId, instanceId = DECRYPTED_SOFTWARE_TOKEN.instanceId;

            if (!(!softwareId || !instanceId)) {
              _context.next = 19;
              break;
            }

            return _context.abrupt("return");

          case 19:
            _context.next = 21;
            return findSoftwareId(softwareId);

          case 21:
            SOFTWARE_ID_OBJECT = _context.sent;
            PATH_SOFTWARE_NAME = path.split('/').filter(Boolean)[1];

            if (!(!SOFTWARE_ID_OBJECT || !PATH_SOFTWARE_NAME || SOFTWARE_ID_OBJECT.name.toLowerCase() !== PATH_SOFTWARE_NAME.toLowerCase())) {
              _context.next = 25;
              break;
            }

            return _context.abrupt("return");

          case 25:
            _context.next = 27;
            return findSoftwareInstance(instanceId);

          case 27:
            SOFTWARE_INSTANCE_OBJECT = _context.sent;

            if (!(!SOFTWARE_INSTANCE_OBJECT || SOFTWARE_INSTANCE_OBJECT.access_token !== accessToken || SOFTWARE_INSTANCE_OBJECT.software_id !== softwareId)) {
              _context.next = 30;
              break;
            }

            return _context.abrupt("return");

          case 30:
            return _context.abrupt("return", true);

          case 31:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function authenticate(_x) {
    return _ref2.apply(this, arguments);
  };
}();

module.exports = {
  authenticate: authenticate
};