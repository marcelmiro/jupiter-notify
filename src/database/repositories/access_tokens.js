'use strict'
const { v4: uuidv4 } = require('uuid')
const client = require('../../config/database')
const model = require('../models/access_tokens')

const findAccessToken = async userId => {
    await model.userId.validateAsync(userId)
    return (await client.query('SELECT * FROM access_tokens WHERE user_id = $1 LIMIT 1', [userId])).rows[0]
}

const findAccessTokenByToken = async token => {
    await model.accessToken.validateAsync(token)
    return (await client.query('SELECT * FROM access_tokens WHERE access_token = $1 LIMIT 1', [token])).rows[0]
}

const insertAccessToken = async userId => {
    await model.userId.validateAsync(userId)
    if (await client.query(
        'INSERT INTO access_tokens (user_id, access_token, iv, created) VALUES ($1, $2, $3, $4)',
        [userId, uuidv4(), uuidv4().slice(0, parseInt(process.env.ENCRYPTION_IV_LENGTH)), new Date().getTime()]
    )) return await findAccessToken(userId)
}

const deleteAccessToken = async userId => {
    await model.userId.validateAsync(userId)
    return await client.query('DELETE FROM access_tokens WHERE user_id = $1', [userId])
}

module.exports = { findAccessToken, findAccessTokenByToken, insertAccessToken, deleteAccessToken }
