'use strict'
const Joi = require('joi')
const { sendSupportMessage } = require('../../services/discord/utils')

const ticket = async (req, res) => {
    try {
        const { username, email, text } = req.body

        try {
            await Joi.object().keys({
                username: Joi.string().required(),
                email: Joi.string().email(),
                text: Joi.string().required()
            }).required().validateAsync({ username, email, text })
        } catch (e) {
            return res.status(400).send({ message: 'Parameter validation failed.' })
        }

        await sendSupportMessage({ username, email, text })
            ? res.sendStatus(200)
            : res.sendStatus(500)
    } catch (e) {
        res.sendStatus(500)
        console.error(e)
    }
}

module.exports = { ticket }
