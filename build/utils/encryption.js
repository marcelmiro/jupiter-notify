'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var crypto = require('crypto');

var ENCRYPTION_TYPE = 'aes-256-cbc';
var ENCRYPTION_ENCODING = 'hex';
var BUFFER_ENCRYPTION = 'utf-8';
var ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
var KEY_LENGTH = parseInt(process.env.ENCRYPTION_KEY_LENGTH);
var IV_LENGTH = parseInt(process.env.ENCRYPTION_IV_LENGTH);
if (ENCRYPTION_KEY.length !== 32) console.fatal('encryption.js: Encryption key is not a 32 character string.');else ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY, BUFFER_ENCRYPTION);
if (!KEY_LENGTH) console.fatal('encryption.js: Key length is not a number.');
if (!IV_LENGTH) console.fatal('encryption.js: IV length is not a number.');

var encrypt = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var iv, text, cipher, encrypted;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            iv = _ref.iv, text = _ref.text;
            _context.prev = 1;
            _context.next = 4;
            return Joi.object().keys({
              iv: Joi.string(),
              text: Joi.string()
            }).options({
              presence: 'required'
            }).validateAsync({
              iv: iv,
              text: text
            });

          case 4:
            _context.next = 9;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context["catch"](1);
            return _context.abrupt("return");

          case 9:
            if (!(iv.length !== IV_LENGTH)) {
              _context.next = 11;
              break;
            }

            return _context.abrupt("return");

          case 11:
            cipher = crypto.createCipheriv(ENCRYPTION_TYPE, ENCRYPTION_KEY, iv);
            encrypted = cipher.update(text, BUFFER_ENCRYPTION, ENCRYPTION_ENCODING);
            return _context.abrupt("return", encrypted + cipher["final"](ENCRYPTION_ENCODING));

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 6]]);
  }));

  return function encrypt(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var decrypt = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(_ref3) {
    var iv, text, buffer, decipher;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            iv = _ref3.iv, text = _ref3.text;
            _context2.prev = 1;
            _context2.next = 4;
            return Joi.object().keys({
              iv: Joi.string(),
              text: Joi.string()
            }).options({
              presence: 'required'
            }).validateAsync({
              iv: iv,
              text: text
            });

          case 4:
            _context2.next = 9;
            break;

          case 6:
            _context2.prev = 6;
            _context2.t0 = _context2["catch"](1);
            return _context2.abrupt("return");

          case 9:
            if (!(iv.length !== IV_LENGTH)) {
              _context2.next = 11;
              break;
            }

            return _context2.abrupt("return");

          case 11:
            iv = Buffer.from(iv, BUFFER_ENCRYPTION);
            buffer = Buffer.from(text, ENCRYPTION_ENCODING);
            decipher = crypto.createDecipheriv(ENCRYPTION_TYPE, ENCRYPTION_KEY, iv);
            return _context2.abrupt("return", decipher.update(buffer) + decipher["final"]());

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 6]]);
  }));

  return function decrypt(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
};