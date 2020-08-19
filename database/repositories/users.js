'use strict'
const { v4: uuidv4 } = require('uuid')
const client = require('../../config/database')
const model = require('../models/users')

const listUsers = async () => {
    try {
        return (await client.query('SELECT * FROM users')).rows
    } catch (e) {
        return console.error('listUsers(): ' + e.message)
    }
}

const findUser = async id => {
    try {
        await model.userId.validateAsync(id)
        return (await client.query('SELECT * FROM users WHERE user_id = $1', [id])).rows[0]
    } catch (e) {
        return console.error('findUser(): ' + e.message)
    }
}

const findUserByCookie = async id => {
    try {
        await model.cookieId.validateAsync(id)
        return (await client.query('SELECT * FROM users WHERE cookie_id = $1', [id])).rows[0]
    } catch (e) {
        return console.error('findUserByCookie(): ' + e.message)
    }
}

const findUserByStripe = async id => {
    try {
        await model.stripeId.validateAsync(id)
        return (await client.query('SELECT * FROM users WHERE stripe_id = $1', [id])).rows[0]
    } catch (e) {
        return console.error('findUserByStripe(): ' + e.message)
    }
}

const insertUser = async user => {
    try {
        await model.schema.validateAsync(user)
        const { userId, stripeId, username, email, avatarUrl } = user
        const COLUMNS = 'user_id, cookie_id, stripe_id, username, email, avatar_url, date_created'
        const VALUES = [userId, uuidv4(), stripeId, username, email, avatarUrl, (new Date()).valueOf()]

        return await client.query(
            `INSERT INTO users (${COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            VALUES
        )
    } catch (e) {
        return console.error('insertUser(): ' + e.message)
    }
}

const updateUser = async (id, column, value) => {
    try {
        if (column === 'user_id') return console.error('updateUser(): Can\'t update user_id.')
        const FIELDS = (await client.query('SELECT * FROM users WHERE false')).fields.map(f => f.name)
        if (!FIELDS.includes(column)) return console.error(`updateUser(): Column '${column}' not found.`)
        const COLUMN_CAMEL_CASE = column.replace(/(_\w)/g, letter => letter[1].toUpperCase())

        await model.userId.validateAsync(id)
        await model[COLUMN_CAMEL_CASE].validateAsync(value)

        if (!(await findUser(id))) return console.error('updateUser(): User id not found.')
        return await client.query(`UPDATE users SET ${column} = '${value}' WHERE user_id = '${id}'`)
    } catch (e) {
        return console.error('updateUser(): ' + e.message)
    }
}

module.exports = { listUsers, findUser, findUserByCookie, findUserByStripe, insertUser, updateUser }
