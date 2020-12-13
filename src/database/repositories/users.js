'use strict'
const { v4: uuidv4 } = require('uuid')
const client = require('../../config/database')
const model = require('../models/users')

const listUsers = async () => {
    return (await client.query('SELECT * FROM users')).rows
}

const findUser = async id => {
    await model.userId.validateAsync(id)
    return (
        await client.query('SELECT * FROM users WHERE user_id = $1 LIMIT 1', [id])
    ).rows[0]
}

const findUserByUsername = async username => {
    await model.username.validateAsync(username)
    return (
        await client.query(
            'SELECT * FROM users WHERE LOWER(username) = $1 LIMIT 1',
            [username.toLowerCase()]
        )
    ).rows[0]
}

const findUserByCookie = async id => {
    await model.cookieId.validateAsync(id)
    return (
        await client.query('SELECT * FROM users WHERE cookie_id = $1 LIMIT 1', [id])
    ).rows[0]
}

const findUserByStripe = async id => {
    await model.stripeId.validateAsync(id)
    return (
        await client.query(
            'SELECT * FROM users WHERE LOWER(stripe_id) = $1 LIMIT 1',
            [id.toLowerCase()]
        )
    ).rows[0]
}

const findUserByEmail = async email => {
    await model.email.validateAsync(email)
    return (
        await client.query(
            'SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1',
            [email.toLowerCase()]
        )
    ).rows[0]
}

const insertUser = async ({ userId, stripeId, username, email, avatarUrl }) => {
    await model.insertUser.validateAsync({ userId, stripeId, username, email, avatarUrl })
    const columns = 'user_id, cookie_id, stripe_id, username, email, avatar_url, last_login'
    const values = [userId, uuidv4(), stripeId, username, email, avatarUrl, new Date().getTime()]

    return await client.query(
        `INSERT INTO users (${columns}) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        values
    )
}

const updateUser = async (id, column, value) => {
    column = column?.toLowerCase()
    if (column === 'user_id') return
    const fields = (
        await client.query('SELECT * FROM users WHERE false')
    )?.fields.map(field => field.name)
    if (!fields.includes(column)) return

    const columnCamelCase = column.replace(/(_\w)/g, letter => letter[1].toUpperCase())
    if (!model[columnCamelCase]) return
    await Promise.all([
        model.userId.validateAsync(id),
        model[columnCamelCase].validateAsync(value)
    ])

    return await client.query(
        `UPDATE users SET ${column} = $1 WHERE user_id = $2`,
        [value, id]
    )
}

module.exports = {
    listUsers,
    findUser,
    findUserByUsername,
    findUserByCookie,
    findUserByStripe,
    findUserByEmail,
    insertUser,
    updateUser
}
