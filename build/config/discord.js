'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Discord = require('discord.js');

var client = new Discord.Client();
var guilds = [];

var setup = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var _require, sendLogMessage, CONSOLE_ERROR, CONSOLE_FATAL;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return client.login(process.env.DISCORD_BOT_TOKEN);

          case 2:
            _context.next = 4;
            return new Promise(function (resolve) {
              client.on('ready', function () {
                var _process$env$DISCORD_;

                console.log("Discord bot logged in as ".concat(client.user.tag, "."));
                var GUILD_IDS = (_process$env$DISCORD_ = process.env.DISCORD_GUILDS) === null || _process$env$DISCORD_ === void 0 ? void 0 : _process$env$DISCORD_.split(';').filter(Boolean);
                GUILD_IDS.forEach(function (guildId) {
                  guilds.push(client.guilds.cache.get(guildId));
                });
                resolve(guilds.filter(Boolean));
              });
            });

          case 4:
            guilds = _context.sent;
            _require = require('../services/discord/utils'), sendLogMessage = _require.sendLogMessage;
            CONSOLE_ERROR = console.error;

            console.error = function (msg) {
              CONSOLE_ERROR(msg);
              sendLogMessage('ERROR  ' + msg);
            };

            CONSOLE_FATAL = console.fatal;

            console.fatal = function (msg) {
              CONSOLE_FATAL(msg);
              sendLogMessage('FATAL  ' + msg);
            };

            require('../services/discord');

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function setup() {
    return _ref.apply(this, arguments);
  };
}();

module.exports = {
  setup: setup,
  client: client,
  getGuilds: function getGuilds() {
    return guilds;
  },
  getGuild: function getGuild() {
    return guilds[0];
  }
};