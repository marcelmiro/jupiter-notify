'use strict';

var _require = require('../../config/discord'),
    client = _require.client;

var _require2 = require('./controller'),
    newDiscordMember = _require2.newDiscordMember,
    newDiscordMessage = _require2.newDiscordMessage;

client.on('guildMemberAdd', function (member) {
  return newDiscordMember(member);
});
client.on('message', function (message) {
  return newDiscordMessage(message);
});