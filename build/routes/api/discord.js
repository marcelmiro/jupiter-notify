'use strict';

var router = require('express').Router();

var _require = require('../../controllers/api/discord'),
    ticket = _require.ticket;

router.post('/ticket', ticket);
module.exports = router;