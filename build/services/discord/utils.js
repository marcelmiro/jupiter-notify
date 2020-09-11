'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Joi = require('joi');

var _require = require('../../database/repositories/roles'),
    findRole = _require.findRole,
    findRoleByName = _require.findRoleByName;

var guild = require('../../config/discord').getGuild();

var guilds = require('../../config/discord').getGuilds();

var findDiscordUser = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(id) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return Joi.string().alphanum().required().validateAsync(id);

          case 3:
            _context.next = 8;
            break;

          case 5:
            _context.prev = 5;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return");

          case 8:
            return _context.abrupt("return", guild.member(id) || undefined);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 5]]);
  }));

  return function findDiscordUser(_x) {
    return _ref.apply(this, arguments);
  };
}();

var findDiscordUserInServers = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(id) {
    var USER;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return Joi.string().alphanum().required().validateAsync(id);

          case 3:
            _context2.next = 8;
            break;

          case 5:
            _context2.prev = 5;
            _context2.t0 = _context2["catch"](0);
            return _context2.abrupt("return");

          case 8:
            USER = [];
            guilds.forEach(function (guild) {
              USER.push(guild.member(id) || undefined);
            });
            return _context2.abrupt("return", USER.filter(Boolean));

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 5]]);
  }));

  return function findDiscordUserInServers(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var inviteDiscordUser = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(id, username) {
    var CHANNEL, INVITE;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return Joi.string().alphanum().required().validateAsync(id);

          case 3:
            _context3.next = 8;
            break;

          case 5:
            _context3.prev = 5;
            _context3.t0 = _context3["catch"](0);
            return _context3.abrupt("return");

          case 8:
            _context3.next = 10;
            return findDiscordUser(id);

          case 10:
            if (!_context3.sent) {
              _context3.next = 12;
              break;
            }

            return _context3.abrupt("return");

          case 12:
            CHANNEL = guild.channels.cache.filter(function (c) {
              return c.type === 'text';
            }).sort(function (a, b) {
              return a.rawPosition - b.rawPosition;
            }).first();

            if (CHANNEL) {
              _context3.next = 15;
              break;
            }

            return _context3.abrupt("return");

          case 15:
            _context3.next = 17;
            return CHANNEL.createInvite({
              unique: true,
              maxUses: 1,
              maxAge: 300
            });

          case 17:
            INVITE = _context3.sent;
            console.log("User '".concat(username, "' created Discord invite: ").concat(INVITE.code, "."));
            return _context3.abrupt("return", 'https://discord.gg/' + INVITE);

          case 20:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 5]]);
  }));

  return function inviteDiscordUser(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();

var kickDiscordUser = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(id) {
    var USER, KICK, i;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return Joi.string().alphanum().required().validateAsync(id);

          case 3:
            _context4.next = 8;
            break;

          case 5:
            _context4.prev = 5;
            _context4.t0 = _context4["catch"](0);
            return _context4.abrupt("return");

          case 8:
            _context4.next = 10;
            return findDiscordUserInServers(id);

          case 10:
            USER = _context4.sent;

            if (!(!USER || USER.length === 0)) {
              _context4.next = 13;
              break;
            }

            return _context4.abrupt("return");

          case 13:
            KICK = [];
            i = 0;

          case 15:
            if (!(i < USER.length)) {
              _context4.next = 24;
              break;
            }

            _context4.t1 = KICK;
            _context4.next = 19;
            return USER[i].kick();

          case 19:
            _context4.t2 = _context4.sent;

            _context4.t1.push.call(_context4.t1, _context4.t2);

          case 21:
            i++;
            _context4.next = 15;
            break;

          case 24:
            console.log("User '".concat(USER[0].user.username, "#").concat(USER[0].user.discriminator, "' has been kicked from server."));
            return _context4.abrupt("return", KICK);

          case 26:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 5]]);
  }));

  return function kickDiscordUser(_x5) {
    return _ref4.apply(this, arguments);
  };
}();

var addDiscordRole = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(id, role) {
    var USER, ROLE;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.next = 3;
            return Joi.object().keys({
              id: Joi.string().alphanum().required(),
              role: [Joi.string().alphanum().required(), Joi.number().required()]
            }).required().validateAsync({
              id: id,
              role: role
            });

          case 3:
            _context5.next = 8;
            break;

          case 5:
            _context5.prev = 5;
            _context5.t0 = _context5["catch"](0);
            return _context5.abrupt("return");

          case 8:
            _context5.next = 10;
            return findDiscordUser(id);

          case 10:
            USER = _context5.sent;

            if (!USER) {
              _context5.next = 17;
              break;
            }

            _context5.next = 14;
            return findRole(role);

          case 14:
            _context5.t1 = _context5.sent;
            _context5.next = 18;
            break;

          case 17:
            _context5.t1 = undefined;

          case 18:
            ROLE = _context5.t1;

            if (ROLE === null || ROLE === void 0 ? void 0 : ROLE['discord_id']) {
              _context5.next = 21;
              break;
            }

            return _context5.abrupt("return");

          case 21:
            return _context5.abrupt("return", USER.roles.add(ROLE.discord_id));

          case 22:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 5]]);
  }));

  return function addDiscordRole(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
}();

var addDiscordRoleByName = function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(id, role) {
    var USER, ROLE;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return Joi.object().keys({
              id: Joi.string().alphanum().required(),
              role: Joi.string().alphanum().required()
            }).required().validateAsync({
              id: id,
              role: role
            });

          case 3:
            _context6.next = 8;
            break;

          case 5:
            _context6.prev = 5;
            _context6.t0 = _context6["catch"](0);
            return _context6.abrupt("return");

          case 8:
            _context6.next = 10;
            return findDiscordUser(id);

          case 10:
            USER = _context6.sent;

            if (!USER) {
              _context6.next = 17;
              break;
            }

            _context6.next = 14;
            return findRoleByName(role);

          case 14:
            _context6.t1 = _context6.sent;
            _context6.next = 18;
            break;

          case 17:
            _context6.t1 = undefined;

          case 18:
            ROLE = _context6.t1;

            if (ROLE === null || ROLE === void 0 ? void 0 : ROLE['discord_id']) {
              _context6.next = 21;
              break;
            }

            return _context6.abrupt("return");

          case 21:
            return _context6.abrupt("return", USER.roles.add(ROLE.discord_id));

          case 22:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[0, 5]]);
  }));

  return function addDiscordRoleByName(_x8, _x9) {
    return _ref6.apply(this, arguments);
  };
}();

var deleteDiscordRole = function () {
  var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(id, role) {
    var USER, ROLE;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return Joi.object().keys({
              id: Joi.string().alphanum().required(),
              role: [Joi.string().alphanum().required(), Joi.number().required()]
            }).required().validateAsync({
              id: id,
              role: role
            });

          case 3:
            _context7.next = 8;
            break;

          case 5:
            _context7.prev = 5;
            _context7.t0 = _context7["catch"](0);
            return _context7.abrupt("return");

          case 8:
            _context7.next = 10;
            return findDiscordUser(id);

          case 10:
            USER = _context7.sent;

            if (!USER) {
              _context7.next = 17;
              break;
            }

            _context7.next = 14;
            return findRole(role);

          case 14:
            _context7.t1 = _context7.sent;
            _context7.next = 18;
            break;

          case 17:
            _context7.t1 = undefined;

          case 18:
            ROLE = _context7.t1;

            if (ROLE === null || ROLE === void 0 ? void 0 : ROLE['discord_id']) {
              _context7.next = 21;
              break;
            }

            return _context7.abrupt("return");

          case 21:
            return _context7.abrupt("return", USER.roles.remove(ROLE.discord_id));

          case 22:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[0, 5]]);
  }));

  return function deleteDiscordRole(_x10, _x11) {
    return _ref7.apply(this, arguments);
  };
}();

var deleteDiscordRoleByName = function () {
  var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(id, role) {
    var USER, ROLE;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            _context8.next = 3;
            return Joi.object().keys({
              id: Joi.string().alphanum().required(),
              role: Joi.string().alphanum().required()
            }).required().validateAsync({
              id: id,
              role: role
            });

          case 3:
            _context8.next = 8;
            break;

          case 5:
            _context8.prev = 5;
            _context8.t0 = _context8["catch"](0);
            return _context8.abrupt("return");

          case 8:
            _context8.next = 10;
            return findDiscordUser(id);

          case 10:
            USER = _context8.sent;

            if (!USER) {
              _context8.next = 17;
              break;
            }

            _context8.next = 14;
            return findRoleByName(role);

          case 14:
            _context8.t1 = _context8.sent;
            _context8.next = 18;
            break;

          case 17:
            _context8.t1 = undefined;

          case 18:
            ROLE = _context8.t1;

            if (ROLE === null || ROLE === void 0 ? void 0 : ROLE['discord_id']) {
              _context8.next = 21;
              break;
            }

            return _context8.abrupt("return");

          case 21:
            _context8.next = 23;
            return USER.roles.remove(ROLE.discord_id);

          case 23:
            return _context8.abrupt("return", _context8.sent);

          case 24:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 5]]);
  }));

  return function deleteDiscordRoleByName(_x12, _x13) {
    return _ref8.apply(this, arguments);
  };
}();

var sendDiscordMessage = function () {
  var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(channel, msg) {
    var CHANNEL;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            _context9.next = 3;
            return Joi.object().keys({
              channel: [Joi.string().alphanum().required(), Joi.number().required()],
              msg: Joi.string().required()
            }).required().validateAsync({
              channel: channel,
              msg: msg
            });

          case 3:
            _context9.next = 8;
            break;

          case 5:
            _context9.prev = 5;
            _context9.t0 = _context9["catch"](0);
            return _context9.abrupt("return");

          case 8:
            CHANNEL = guild.channels.cache.get(channel);

            if (CHANNEL) {
              _context9.next = 11;
              break;
            }

            return _context9.abrupt("return");

          case 11:
            return _context9.abrupt("return", CHANNEL.send(msg));

          case 12:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[0, 5]]);
  }));

  return function sendDiscordMessage(_x14, _x15) {
    return _ref9.apply(this, arguments);
  };
}();

var sendLogMessage = function () {
  var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(msg) {
    var CHANNEL;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            _context10.next = 3;
            return Joi.string().required().validateAsync(msg);

          case 3:
            _context10.next = 8;
            break;

          case 5:
            _context10.prev = 5;
            _context10.t0 = _context10["catch"](0);
            return _context10.abrupt("return");

          case 8:
            CHANNEL = guild.channels.cache.get(process.env.DISCORD_LOGGER_CHANNEL);

            if (CHANNEL) {
              _context10.next = 11;
              break;
            }

            return _context10.abrupt("return");

          case 11:
            return _context10.abrupt("return", CHANNEL.send(msg));

          case 12:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[0, 5]]);
  }));

  return function sendLogMessage(_x16) {
    return _ref10.apply(this, arguments);
  };
}();

var sendSupportMessage = function () {
  var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(_ref11) {
    var username, email, text, embed, CHANNEL;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            username = _ref11.username, email = _ref11.email, text = _ref11.text;
            _context11.prev = 1;
            _context11.next = 4;
            return Joi.object().keys({
              username: Joi.string().required(),
              email: Joi.string().email(),
              text: Joi.string().required()
            }).required().validateAsync({
              username: username,
              email: email,
              text: text
            });

          case 4:
            _context11.next = 9;
            break;

          case 6:
            _context11.prev = 6;
            _context11.t0 = _context11["catch"](1);
            return _context11.abrupt("return");

          case 9:
            embed = {
              color: 16748288,
              author: {
                name: 'Discord username: ' + username
              },
              fields: [{
                name: 'Text',
                value: text
              }]
            };
            if (email) embed.fields.unshift({
              name: 'Email',
              value: email
            });
            CHANNEL = guild.channels.cache.get(process.env.DISCORD_SUPPORT_CHANNEL);

            if (CHANNEL) {
              _context11.next = 14;
              break;
            }

            return _context11.abrupt("return");

          case 14:
            return _context11.abrupt("return", CHANNEL.send({
              embed: embed
            }));

          case 15:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[1, 6]]);
  }));

  return function sendSupportMessage(_x17) {
    return _ref12.apply(this, arguments);
  };
}();

module.exports = {
  findDiscordUser: findDiscordUser,
  findDiscordUserInServers: findDiscordUserInServers,
  inviteDiscordUser: inviteDiscordUser,
  kickDiscordUser: kickDiscordUser,
  addDiscordRole: addDiscordRole,
  addDiscordRoleByName: addDiscordRoleByName,
  deleteDiscordRole: deleteDiscordRole,
  deleteDiscordRoleByName: deleteDiscordRoleByName,
  sendDiscordMessage: sendDiscordMessage,
  sendLogMessage: sendLogMessage,
  sendSupportMessage: sendSupportMessage
};