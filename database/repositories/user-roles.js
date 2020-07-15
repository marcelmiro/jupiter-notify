'use strict'
const client = require('../../config/database')
const model = require('../models/user-roles')
const { findRole } = require('./roles')

const listUserRoles = async () => {
    try {
        return (await client.query('SELECT * FROM user_roles')).rows
    } catch (e) {
        return console.error('listUserRoles(): ' + e.message)
    }
}

const findUserRole = async id => {
    try {
        await model.userId.validateAsync(id)
        return (await client.query('SELECT * FROM user_roles WHERE user_id = $1', [id])).rows[0]
    } catch (e) {
        return console.error('findUserRole(): ' + e.message)
    }
}

const findRoleFromUserRole = async id => {
    try {
        await model.userId.validateAsync(id)
        const USER_ROLE = (await client.query('SELECT * FROM user_roles WHERE user_id = $1', [id])).rows[0]
        return USER_ROLE?.['role_id'] ? await findRole(USER_ROLE.role_id) : undefined
    } catch (e) {
        return console.error('findRoleFromUserRole(): ' + e.message)
    }
}

const insertUserRole = async (userId, roleId) => {
    try {
        await model.schema.validateAsync({ userId, roleId })
        return await client.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
            [userId, roleId]
        )
    } catch (e) {
        return console.error('insertUserRole(): ' + e.message)
    }
}

const updateUserRole = async (userId, roleId) => {
    try {
        await model.schema.validateAsync({ userId: userId, roleId: roleId })

        if (await findUserRole(userId)) {
            return await client.query(
                `UPDATE user_roles SET role_id = '${roleId}' WHERE user_id = '${userId}'`
            )
        } else return console.error('updateUserRole(): User id not found.')
    } catch (e) {
        return console.error('updateUserRole(): ' + e.message)
    }
}

const deleteUserRole = async id => {
    try {
        await model.userId.validateAsync(id)

        if (await findUserRole(id)) {
            return await client.query('DELETE FROM user_roles WHERE user_id = $1', [id])
        }
    } catch (e) {
        return console.error('deleteUserRole(): ' + e.message)
    }
}

module.exports = { listUserRoles, findUserRole, findRoleFromUserRole, insertUserRole, updateUserRole, deleteUserRole }
