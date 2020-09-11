'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var _require = require('../../services/discord/utils'),
    sendSupportMessage = _require.sendSupportMessage;

var ticket = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var _req$body, username, email, text;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _req$body = req.body, username = _req$body.username, email = _req$body.email, text = _req$body.text;
            _context.prev = 2;
            _context.next = 5;
            return Joi.object().keys({
              username: Joi.string().required(),
              email: Joi.string().email(),
              text: Joi.string().required()
            }).required().validateAsync({
              username: username,
              email: email,
              text: text
            });

          case 5:
            _context.next = 10;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](2);
            return _context.abrupt("return", res.status(400).send({
              message: 'Parameter validation failed.'
            }));

          case 10:
            _context.next = 12;
            return sendSupportMessage({
              username: username,
              email: email,
              text: text
            });

          case 12:
            if (!_context.sent) {
              _context.next = 16;
              break;
            }

            res.sendStatus(200);
            _context.next = 17;
            break;

          case 16:
            res.sendStatus(500);

          case 17:
            _context.next = 23;
            break;

          case 19:
            _context.prev = 19;
            _context.t1 = _context["catch"](0);
            res.sendStatus(500);
            console.error(_context.t1);

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 19], [2, 7]]);
  }));

  return function ticket(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = {
  ticket: ticket
};