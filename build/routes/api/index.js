'use strict';

var bodyParser = require('body-parser');

var router = require('express').Router();

var _require = require('../../controllers/api'),
    authorize = _require.authorize;

router.use(bodyParser.json());
router.use(function (err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    if (err.body === '[object Object]') {
      return res.status(400).send({
        message: 'Request\'s body must be sent as a string.'
      });
    }

    console.error(err);
    return res.sendStatus(400);
  }

  next();
});
router.use('/discord', require('./discord'));
router.use('/jupiterscripts', require('./jupiterscripts'));
router.post('/authorize', authorize);
router.use(function (req, res) {
  return res.sendStatus(404);
});
module.exports = router;