'use strict'
const { authenticate } = require('../../services/api')

const authorize = async (req, res) => {
    try {
        const { accessToken, softwareToken } = req.body
        if (await authenticate({ path: req.originalUrl, accessToken, softwareToken })) res.sendStatus(200)
        else res.sendStatus(404)
    } catch (e) {
        res.sendStatus(500)
        console.error(e)
    }
}

module.exports = { authorize }
