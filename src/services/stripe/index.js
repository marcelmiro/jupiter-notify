'use strict'

module.exports = {
    ...require('./customers'),
    ...require('./subscriptions'),
    ...require('./sessions'),
    ...require('./payment-methods'),
    ...require('./invoices'),
    ...require('./setup-intents'),
    ...require('./webhook')
}
