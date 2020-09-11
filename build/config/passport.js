'use strict';

var passport = require('passport');

var DiscordStrategy = require('passport-discord');

var _require = require('./cookies'),
    secret = _require.keys;

var _require2 = require('../database/repositories/users'),
    findUserByCookie = _require2.findUserByCookie;

var _require3 = require('../services/users'),
    loginUser = _require3.loginUser;

passport.serializeUser(function (user, done) {
  return done(null, user.cookie_id);
});
passport.deserializeUser(function (id, done) {
  return findUserByCookie(id).then(function (user) {
    return done(null, user);
  });
});
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: '/login/redirect'
}, function (accessToken, refreshToken, profile, done) {
  var id = profile.id,
      username = profile.username,
      discriminator = profile.discriminator,
      email = profile.email,
      avatar = profile.avatar;
  var avatarUrl = avatar ? "https://cdn.discordapp.com/avatars/".concat(id, "/").concat(avatar, "?size=2048") : 'https://cdn.discordapp.com/embed/avatars/1.png?size=2048';
  loginUser({
    userId: id,
    username: "".concat(username, "#").concat(discriminator),
    email: email,
    avatarUrl: avatarUrl
  }).then(function (user) {
    return done(null, user);
  })["catch"](console.error);
}));
module.exports = {
  secret: secret,
  saveUninitialized: false,
  resave: false
};