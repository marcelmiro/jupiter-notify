'use strict'
const client = require('../../config/database')
const model = require('../models/roles')

const listRoles = async () => {
    return (await client.query('SELECT * FROM roles NATURAL JOIN role_permissions')).rows
}

const findRole = async id => {
    await model.roleId.validateAsync(id)
    return (
        await client.query(
            'SELECT * FROM roles NATURAL JOIN role_permissions WHERE role_id = $1 LIMIT 1',
            [id]
        )
    ).rows[0]
}

const findRoleByName = async name => {
    await model.name.validateAsync(name)
    return (
        await client.query(
            'SELECT * FROM roles NATURAL JOIN role_permissions WHERE name = $1 LIMIT 1',
            [name.toLowerCase()]
        )
    ).rows[0]
}

const findRolePermissions = async id => {
    await model.roleId.validateAsync(id)
    return (
        await client.query(
            'SELECT * FROM role_permissions WHERE role_id = $1 LIMIT 1',
            [id]
        )
    ).rows[0]
}

module.exports = { listRoles, findRole, findRoleByName, findRolePermissions }
