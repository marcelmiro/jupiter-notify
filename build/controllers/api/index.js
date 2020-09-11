'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('uuid'),
    uuidValidate = _require.validate,
    uuidv4 = _require.v4;

var _require2 = require('../../database/repositories/software_ids'),
    findSoftwareId = _require2.findSoftwareId;

var _require3 = require('../../database/repositories/access_tokens'),
    findAccessTokenByToken = _require3.findAccessTokenByToken;

var _require4 = require('../../database/repositories/software_instances'),
    findSoftwareInstanceByAccessToken = _require4.findSoftwareInstanceByAccessToken,
    insertSoftwareInstance = _require4.insertSoftwareInstance;

var _require5 = require('../../utils/encryption'),
    encrypt = _require5.encrypt;

var authorize = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var _req$body, softwareId, accessToken, SOFTWARE_ID, ACCESS_TOKEN, instanceId, softwareToken;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _req$body = req.body, softwareId = _req$body.softwareId, accessToken = _req$body.accessToken;

            if (!(!uuidValidate(softwareId) || !uuidValidate(accessToken))) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", res.status(400).send({
              message: 'Parameter validation failed.'
            }));

          case 4:
            _context.next = 6;
            return findSoftwareId(softwareId);

          case 6:
            SOFTWARE_ID = _context.sent;

            if (!SOFTWARE_ID) {
              _context.next = 13;
              break;
            }

            _context.next = 10;
            return findAccessTokenByToken(accessToken);

          case 10:
            _context.t0 = _context.sent;
            _context.next = 14;
            break;

          case 13:
            _context.t0 = undefined;

          case 14:
            ACCESS_TOKEN = _context.t0;
            _context.t1 = !ACCESS_TOKEN;

            if (_context.t1) {
              _context.next = 20;
              break;
            }

            _context.next = 19;
            return findSoftwareInstanceByAccessToken({
              softwareId: softwareId,
              accessToken: accessToken
            });

          case 19:
            _context.t1 = _context.sent;

          case 20:
            if (!_context.t1) {
              _context.next = 22;
              break;
            }

            return _context.abrupt("return", res.status(403).send({
              message: 'Parameter verification failed.'
            }));

          case 22:
            instanceId = uuidv4();
            _context.next = 25;
            return encrypt({
              iv: ACCESS_TOKEN.iv,
              text: JSON.stringify({
                softwareId: softwareId,
                instanceId: instanceId
              })
            });

          case 25:
            softwareToken = _context.sent;
            _context.t2 = !softwareToken;

            if (_context.t2) {
              _context.next = 31;
              break;
            }

            _context.next = 30;
            return insertSoftwareInstance({
              accessToken: accessToken,
              softwareId: softwareId,
              instanceId: instanceId
            });

          case 30:
            _context.t2 = !_context.sent;

          case 31:
            if (!_context.t2) {
              _context.next = 33;
              break;
            }

            return _context.abrupt("return", res.sendStatus(500));

          case 33:
            res.status(200).send({
              accessToken: accessToken,
              softwareToken: softwareToken
            });
            _context.next = 40;
            break;

          case 36:
            _context.prev = 36;
            _context.t3 = _context["catch"](0);
            res.sendStatus(500);
            console.error(_context.t3);

          case 40:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 36]]);
  }));

  return function authorize(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = {
  authorize: authorize
};