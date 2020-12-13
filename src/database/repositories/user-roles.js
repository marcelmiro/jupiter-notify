'use strict'
const client = require('../../config/database')
const model = require('../models/user-roles')

const listUserRoles = async roleId => {
    if (!roleId) return (await client.query('SELECT * FROM user_roles')).rows
    await model.roleId.validateAsync(roleId)
    return (
        await client.query('SELECT * FROM user_roles WHERE role_id = $1', [roleId])
    ).rows
}

const listUsersAndRolesFromUserRoles = async () => {
    return (
        await client.query(
            'SELECT *, roles.role_id FROM user_roles INNER JOIN users ON user_roles.user_id = users.user_id ' +
            'INNER JOIN roles ON user_roles.role_id = roles.role_id ' +
            'LEFT JOIN permissions ON roles.role_id = permissions.role_id'
        )
    ).rows
}

const listUsersFromRoles = async array => {
    await model.arrayRoleIds.validateAsync(array)

    let query = []
    for (let i = 0; i < array.length; i++) query.push(`role_id = $${i + 1}`)
    query = query.join(' OR ')

    return (
        await client.query(
            'SELECT * FROM user_roles INNER JOIN users ON user_roles.user_id = users.user_id WHERE ' + query,
            array
        )
    ).rows
}

const findUserRole = async id => {
    await model.userId.validateAsync(id)
    return (
        await client.query('SELECT * FROM user_roles WHERE user_id = $1 LIMIT 1', [id])
    ).rows[0]
}

const findRoleFromUserRole = async id => {
    await model.userId.validateAsync(id)
    return (
        await client.query(
            'SELECT * FROM user_roles INNER JOIN roles ON user_roles.role_id = roles.role_id ' +
            'WHERE user_id = $1 LIMIT 1',
            [id]
        )
    ).rows[0]
}

const insertUserRole = async (userId, roleId) => {
    await model.schema.validateAsync({ userId, roleId })
    return await client.query(
        'INSERT INTO user_roles (user_id, role_id, created) VALUES ($1, $2, $3)',
        [userId, roleId, new Date().getTime()]
    )
}

const updateUserRole = async (userId, roleId) => {
    await model.schema.validateAsync({ userId, roleId })
    return await client.query(
        'UPDATE user_roles SET role_id = $1 WHERE user_id = $2',
        [roleId, userId]
    )
}

const deleteUserRole = async id => {
    await model.userId.validateAsync(id)
    return await client.query('DELETE FROM user_roles WHERE user_id = $1', [id])
}

const deleteUserRoleByRole = async roleId => {
    await model.roleId.validateAsync(roleId)
    return await client.query('DELETE FROM user_roles WHERE role_id = $1', [roleId])
}

module.exports = {
    listUserRoles,
    listUsersAndRolesFromUserRoles,
    listUsersFromRoles,
    findUserRole,
    findRoleFromUserRole,
    insertUserRole,
    updateUserRole,
    deleteUserRole,
    deleteUserRoleByRole
}
