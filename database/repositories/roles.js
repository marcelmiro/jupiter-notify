'use strict'
const client = require('../../config/database')
const model = require('../models/roles')

const listRoles = async () => {
    try {
        return (await client.query('SELECT * FROM roles NATURAL JOIN role_permissions')).rows
    } catch (e) {
        return console.error('listRoles(): ' + e.message)
    }
}

const findRole = async id => {
    try {
        await model.roleId.validateAsync(id)
        return (
            await client.query(
                'SELECT * FROM roles NATURAL JOIN role_permissions WHERE role_id = $1',
                [id]
            )
        ).rows[0]
    } catch (e) {
        return console.error('findRole(): ' + e.message)
    }
}

const findRoleByName = async name => {
    try {
        await model.name.validateAsync(name)
        return (
            await client.query(
                'SELECT * FROM roles NATURAL JOIN role_permissions WHERE name = $1',
                [name.toLowerCase()])
        ).rows[0]
    } catch (e) {
        return console.error('findRoleByName(): ' + e.message)
    }
}

const findRolePermissions = async id => {
    try {
        await model.roleId.validateAsync(id)
        return (
            await client.query(
                'SELECT * FROM role_permissions WHERE role_id = $1',
                [id]
            )
        ).rows[0]
    } catch (e) {
        return console.error('findRolePermissions(): ' + e.message)
    }
}

module.exports = { listRoles, findRole, findRoleByName, findRolePermissions }
