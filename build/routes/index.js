'use strict';

var router = require('express').Router();

var _require = require('../controllers'),
    index = _require.index,
    dashboard = _require.dashboard,
    admin = _require.admin,
    join = _require.join,
    terms = _require.terms;

router.use('/', require('./auth'));
router.use('/stripe', require('./stripe'));
router.use('/api', require('./api'));
router.get('/', index);
router.get('/dashboard', dashboard);
router.get('/admin', admin);
router.get('/join', join);
router.get('/terms', terms);
module.exports = router;