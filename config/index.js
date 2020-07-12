'use strict'

module.exports = async () => {
    await require('./database').setup()
    await require('./discord').setup()
    require('./passport')
    require('./stripe')
}
