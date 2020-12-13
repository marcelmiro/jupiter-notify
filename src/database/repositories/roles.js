'use strict'
const client = require('../../config/database')
const model = require('../models/roles')

const listRoles = async () => {
    return (
        await client.query(
            'SELECT *, roles.role_id FROM roles LEFT JOIN permissions ON roles.role_id = permissions.role_id'
        )
    ).rows
}

const findRole = async id => {
    await model.roleId.validateAsync(id)
    return (
        await client.query(
            'SELECT *, roles.role_id FROM roles LEFT JOIN permissions ON roles.role_id = permissions.role_id ' +
            'WHERE roles.role_id = $1 LIMIT 1',
            [id]
        )
    ).rows[0]
}

const findRoleByName = async name => {
    await model.name.validateAsync(name)
    return (
        await client.query(
            'SELECT *, roles.role_id FROM roles LEFT JOIN permissions ON roles.role_id = permissions.role_id ' +
            'WHERE LOWER(roles.name) = $1 LIMIT 1',
            [name.toLowerCase()]
        )
    ).rows[0]
}

const insertRole = async ({ name, color, discordId, transferable }) => {
    await model.insertRole.validateAsync({ name, color, discordId, transferable })
    return await client.query(
        'INSERT INTO roles (name, color, discord_id, transferable) VALUES ($1, $2, $3, $4)',
        [name, color, discordId, transferable]
    )
}

const updateRole = async (id, column, value) => {
    column = column?.toLowerCase()
    if (column === 'role_id') return
    const fields = (
        await client.query('SELECT * FROM roles WHERE false')
    )?.fields.map(field => field.name)
    if (!fields.includes(column)) return

    const columnCamelCase = column.replace(/(_\w)/g, letter => letter[1].toUpperCase())
    if (!model.updateRole[columnCamelCase]) return
    await Promise.all([
        model.roleId.validateAsync(id),
        model.updateRole[columnCamelCase].validateAsync(value)
    ])

    return await client.query(
        `UPDATE roles SET ${column} = $1 WHERE role_id = $2`,
        [value, id]
    )
}

const deleteRole = async id => {
    await model.roleId.validateAsync(id)
    const response = await client.query('DELETE FROM roles WHERE role_id = $1', [id])
    if (response) await client.query('DELETE FROM permissions WHERE role_id = $1', [id])
    return response
}

module.exports = { listRoles, findRole, findRoleByName, insertRole, updateRole, deleteRole }
