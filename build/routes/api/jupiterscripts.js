'use strict';

var router = require('express').Router();

var _require = require('../../controllers/api/jupiterscripts'),
    authorize = _require.authorize;

router.post('/authorize', authorize);
module.exports = router;