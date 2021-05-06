'use strict'
const Joi = require('joi')
const { authenticate } = require('../../services/api')
const { findUserRole } = require('../../database/repositories/user-roles')

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

const download = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login?redirect=' + req.originalUrl)
        if (!(await findUserRole(req.user.user_id))) return res.redirect('/')
        const URL = process.env.DOWNLOAD_JUPITERSCRIPTS

        try {
            await Joi.string().uri().required().validateAsync(URL)
        } catch (e) {
            return res.render('response', { status: 'download-fail' })
        }

        res.redirect(URL)
    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
}

module.exports = { authorize, download }
