'use strict'
const Joi = require('joi')
const crypto = require('crypto')

const ENCRYPTION_TYPE = 'aes-256-cbc'
const ENCRYPTION_ENCODING = 'hex'
const BUFFER_ENCRYPTION = 'utf-8'

let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const KEY_LENGTH = parseInt(process.env.ENCRYPTION_KEY_LENGTH)
const IV_LENGTH = parseInt(process.env.ENCRYPTION_IV_LENGTH)

if (ENCRYPTION_KEY.length !== 32) console.fatal('encryption.js: Encryption key is not a 32 character string.')
else ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY, BUFFER_ENCRYPTION)
if (!KEY_LENGTH) console.fatal('encryption.js: Key length is not a number.')
if (!IV_LENGTH) console.fatal('encryption.js: IV length is not a number.')

const encrypt = async ({ iv, text }) => {
    try {
        await Joi.object().keys({
            iv: Joi.string(),
            text: Joi.string()
        }).options({ presence: 'required' }).validateAsync({ iv, text })
    } catch (e) { return }

    if (iv.length !== IV_LENGTH) return
    const cipher = crypto.createCipheriv(ENCRYPTION_TYPE, ENCRYPTION_KEY, iv)
    const encrypted = cipher.update(text, BUFFER_ENCRYPTION, ENCRYPTION_ENCODING)
    return encrypted + cipher.final(ENCRYPTION_ENCODING)
}

const decrypt = async ({ iv, text }) => {
    try {
        await Joi.object().keys({
            iv: Joi.string(),
            text: Joi.string()
        }).options({ presence: 'required' }).validateAsync({ iv, text })
    } catch (e) { return }

    if (iv.length !== IV_LENGTH) return
    iv = Buffer.from(iv, BUFFER_ENCRYPTION)

    const buffer = Buffer.from(text, ENCRYPTION_ENCODING)
    const decipher = crypto.createDecipheriv(ENCRYPTION_TYPE, ENCRYPTION_KEY, iv)
    return decipher.update(buffer) + decipher.final()
}

module.exports = { encrypt, decrypt }
