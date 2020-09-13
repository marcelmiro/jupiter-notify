'use strict'

module.exports = async () => {
    try {
        await require('./database').setup()
        await require('./discord').setup()
        require('./passport')
        require('./stripe')
    } catch (e) {
        console.fatal(e)
    }
}
