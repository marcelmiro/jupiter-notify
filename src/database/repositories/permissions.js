'use strict'
const client = require('../../config/database')
const model = require('../models/permissions')

const findPermissions = async roleId => {
    await model.roleId.validateAsync(roleId)
    return (
        await client.query('SELECT * FROM permissions WHERE role_id = $1', [roleId])
    ).rows[0]
}

const insertPermission = async (roleId) => {
    await model.roleId.validateAsync(roleId)
    return await client.query('INSERT INTO permissions (role_id) VALUES ($1)', [roleId])
}

const updatePermission = async (roleId, column, value) => {
    column = column?.toLowerCase()
    if (column === 'role_id') return
    const fields = (
        await client.query('SELECT * FROM permissions WHERE false')
    )?.fields.map(field => field.name)
    if (!fields.includes(column)) return

    const columnCamelCase = column.replace(/(_\w)/g, letter => letter[1].toUpperCase())
    if (!model.updatePermission[columnCamelCase]) return
    await Promise.all([
        model.roleId.validateAsync(roleId),
        model.updatePermission[columnCamelCase].validateAsync(value)
    ])

    return await client.query(
        `UPDATE permissions SET ${column} = $1 WHERE role_id = $2`,
        [value, roleId]
    )
}

module.exports = { findPermissions, insertPermission, updatePermission }
