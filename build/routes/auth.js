'use strict';

var passport = require('passport');

var router = require('express').Router();

var _require = require('../controllers/auth'),
    login = _require.login,
    logout = _require.logout,
    loginRedirect = _require.loginRedirect;

router.get('/login', login);
router.get('/logout', logout);
router.get('/login/redirect', passport.authenticate('discord', {
  failureRedirect: '/'
}), loginRedirect);
module.exports = router;