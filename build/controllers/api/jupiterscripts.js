'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('../../services/api'),
    authenticate = _require.authenticate;

var authorize = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var _req$body, accessToken, softwareToken;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _req$body = req.body, accessToken = _req$body.accessToken, softwareToken = _req$body.softwareToken;
            _context.next = 4;
            return authenticate({
              path: req.originalUrl,
              accessToken: accessToken,
              softwareToken: softwareToken
            });

          case 4:
            if (!_context.sent) {
              _context.next = 8;
              break;
            }

            res.sendStatus(200);
            _context.next = 9;
            break;

          case 8:
            res.sendStatus(404);

          case 9:
            _context.next = 15;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](0);
            res.sendStatus(500);
            console.error(_context.t0);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 11]]);
  }));

  return function authorize(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = {
  authorize: authorize
};