'use strict'
const client = require('../../config/database')
const model = require('../models/user-roles')
const { findRole, findRoleByName } = require('./roles')

const listUserRoles = async () => {
    return (await client.query('SELECT * FROM user_roles')).rows
}

const listUsersAndRolesFromUserRoles = async () => {
    return (await client.query(
        'SELECT * FROM user_roles NATURAL JOIN users NATURAL JOIN roles NATURAL JOIN role_permissions'
    )).rows
}

const listRenewalUsers = async () => {
    const ROLE = await findRoleByName('renewal')
    if (!ROLE?.role_id) return
    return (await client.query(
        'SELECT * FROM user_roles NATURAL JOIN users WHERE role_id = $1',
        [ROLE.role_id]
    )).rows
}

const findUserRole = async id => {
    await model.userId.validateAsync(id)
    return (await client.query('SELECT * FROM user_roles WHERE user_id = $1 LIMIT 1', [id])).rows[0]
}

const findRoleFromUserRole = async id => {
    await model.userId.validateAsync(id)
    const USER_ROLE = (await client.query('SELECT * FROM user_roles WHERE user_id = $1 LIMIT 1', [id])).rows[0]
    return USER_ROLE?.role_id ? await findRole(USER_ROLE.role_id) : undefined
}

const insertUserRole = async (userId, roleId) => {
    await model.schema.validateAsync({ userId, roleId })
    return await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [userId, roleId]
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

module.exports = {
    listUserRoles,
    listUsersAndRolesFromUserRoles,
    listRenewalUsers,
    findUserRole,
    findRoleFromUserRole,
    insertUserRole,
    updateUserRole,
    deleteUserRole
}
