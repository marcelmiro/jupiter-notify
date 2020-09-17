'use strict'
const { v4: uuidv4 } = require('uuid')
const client = require('../../config/database')
const model = require('../models/users')

const listUsers = async () => {
    return (await client.query('SELECT * FROM users')).rows
}

const findUser = async id => {
    await model.userId.validateAsync(id)
    return (await client.query('SELECT * FROM users WHERE user_id = $1 LIMIT 1', [id])).rows[0]
}

const findUserByCookie = async id => {
    await model.cookieId.validateAsync(id)
    return (await client.query('SELECT * FROM users WHERE cookie_id = $1 LIMIT 1', [id])).rows[0]
}

const findUserByStripe = async id => {
    await model.stripeId.validateAsync(id)
    return (await client.query('SELECT * FROM users WHERE stripe_id = $1 LIMIT 1', [id])).rows[0]
}

const insertUser = async ({ userId, stripeId, username, email, avatarUrl }) => {
    await model.schema.validateAsync({ userId, stripeId, username, email, avatarUrl })
    const COLUMNS = 'user_id, cookie_id, stripe_id, username, email, avatar_url, created'
    const VALUES = [userId, uuidv4(), stripeId, username, email, avatarUrl, Date.now()]

    if (await client.query(
        `INSERT INTO users (${COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        VALUES
    )) return await findUser(userId)
}

const updateUser = async (id, column, value) => {
    column = column.toLowerCase()
    if (column === 'user_id') return
    const FIELDS = (await client.query('SELECT * FROM users WHERE false')).fields.map(f => f.name)
    if (!FIELDS.includes(column)) return

    const COLUMN_CAMEL_CASE = column.replace(/(_\w)/g, letter => letter[1].toUpperCase())
    if (!model[COLUMN_CAMEL_CASE]) return
    await model.userId.validateAsync(id)
    await model[COLUMN_CAMEL_CASE].validateAsync(value)

    return await client.query(
        `UPDATE users SET ${column} = $1 WHERE user_id = $2`,
        [value, id]
    )
}

module.exports = {
    listUsers,
    findUser,
    findUserByCookie,
    findUserByStripe,
    insertUser,
    updateUser
}
