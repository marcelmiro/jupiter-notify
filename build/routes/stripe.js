'use strict';

var bodyParser = require('body-parser');

var router = require('express').Router();

var _require = require('../controllers/stripe'),
    pay = _require.pay,
    success = _require.success,
    fail = _require.fail,
    updatePayment = _require.updatePayment,
    cancelMembership = _require.cancelMembership,
    renewMembership = _require.renewMembership,
    transferMembership = _require.transferMembership,
    webhook = _require.webhook;

router.get('/pay', pay);
router.get('/success', success);
router.get('/fail', fail);
router.get('/update-payment', updatePayment);
router.get('/cancel-membership', cancelMembership);
router.get('/renew-membership', renewMembership);
router.get('/transfer-membership/:userId', transferMembership);
router.post('/webhook', bodyParser.raw({
  type: 'application/json'
}), webhook);
module.exports = router;