'use strict'
const Joi = require('joi')
const { findPermissions } = require('../database/repositories/permissions')

const listRolePermissions = async id => {
    await Joi.alternatives(
        [Joi.string().alphanum().required(), Joi.number().required()]
    ).required().validateAsync(id)

    return await findPermissions(id)
}

const listResourcePermissions = async (roleId, resource) => {
    const permissions = await listRolePermissions(roleId)
    if (!permissions) return
    if (permissions.administrator) return 'm'

    await Joi.string().required().validateAsync(resource)
    return permissions[resource.toLowerCase()]
}

const checkPermission = async (roleId, resource, permission) => {
    await Joi.string().required().validateAsync(permission)
    const permissions = await listResourcePermissions(roleId, resource)
    if (!permissions) return false
    if (permissions.includes('m')) return true

    permission = permission.toLowerCase()
    if (permission.length > 1) {
        for (const perm of permission) {
            if (!permissions?.includes(perm)) return false
        }
        return true
    } else return permissions?.includes(permission)
}

module.exports = { listRolePermissions, listResourcePermissions, checkPermission }
