'use strict'
const client = require('../../config/database')
const model = require('../models/restocks')

const listRestocksAndRoles = async () => {
    return (
        await client.query(
            'SELECT *, roles.role_id FROM restocks INNER JOIN roles ON restocks.role_id = roles.role_id ' +
            'LEFT JOIN permissions ON roles.role_id = permissions.role_id'
        )
    ).rows
}

const findRestock = async password => {
    await model.password.validateAsync(password)
    return (
        await client.query('SELECT * FROM restocks WHERE password = $1 LIMIT 1', [password])
    ).rows[0]
}

const insertRestock = async ({ password, roleId, stock, date }) => {
    await model.insertRestock.validateAsync({ password, roleId, stock, date })

    date = new Date(date).getTime() || undefined
    const columns = 'password, role_id, total, stock, date'
    const values = [password, roleId, stock, stock, date]

    return await client.query(
        `INSERT INTO restocks (${columns}) VALUES ($1, $2, $3, $4, $5)`,
        values
    )
}

const updateRestock = async (password, column, value) => {
    await model.password.validateAsync(password)

    column = column?.toLowerCase()
    if (['password', 'role_id'].includes(column)) return
    const fields = (
        await client.query('SELECT * FROM restocks WHERE false')
    )?.fields.map(field => field.name)
    if (!fields.includes(column)) return

    if (['total', 'stock'].includes(column)) {
        await model.stock.validateAsync(value)
        return await client.query(
            'UPDATE restocks SET total = $1, stock = $1 WHERE password = $2',
            [value, password]
        )
    }
    if (column === 'date') {
        await model.date.validateAsync(value)
        return await client.query(
            'UPDATE restocks SET date = $1 WHERE password = $2',
            [value, password]
        )
    }
}

const deleteRestock = async password => {
    await model.password.validateAsync(password)
    return await client.query('DELETE FROM restocks WHERE password = $1', [password])
}

const deleteRestockByRole = async roleId => {
    await model.roleId.validateAsync(roleId)
    return await client.query('DELETE FROM restocks WHERE role_id = $1', [roleId])
}

module.exports = { listRestocksAndRoles, findRestock, insertRestock, updateRestock, deleteRestock, deleteRestockByRole }
