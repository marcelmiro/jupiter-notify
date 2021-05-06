'use strict'
const { validate: uuidValidate } = require('uuid')
const client = require('../../config/database')
const model = require('../models/software_instances')

const findSoftwareInstance = async (instanceId) => {
    await model.instanceId.validateAsync(instanceId)
    return (
        await client.query(
            'SELECT * FROM software_instances WHERE instance_id = $1 LIMIT 1',
            [instanceId]
        )
    ).rows[0]
}

const findSoftwareInstanceByAccessToken = async ({ softwareId, accessToken }) => {
    if (!uuidValidate(accessToken)) throw new TypeError('Access token validation failed.')
    await model.softwareId.validateAsync(softwareId)
    return (
        await client.query(
            'SELECT * FROM software_instances WHERE software_id = $1 AND access_token = $2 LIMIT 1',
            [softwareId, accessToken]
        )
    ).rows[0]
}

const insertSoftwareInstance = async ({ accessToken, softwareId, instanceId }) => {
    if (!uuidValidate(accessToken)) throw new TypeError('Access token validation failed.')
    await model.schema.validateAsync({ softwareId, instanceId })
    return await client.query(
        'INSERT INTO software_instances (access_token, software_id, instance_id) VALUES ($1, $2, $3)',
        [accessToken, softwareId, instanceId]
    )
}

const deleteSoftwareInstances = async accessToken => {
    if (!uuidValidate(accessToken)) throw new TypeError('Access token validation failed.')
    return await client.query(
        'DELETE FROM software_instances WHERE access_token = $1',
        [accessToken]
    )
}

const deleteSoftwareInstance = async (softwareId, accessToken) => {
    if (!uuidValidate(accessToken)) throw new TypeError('Access token validation failed.')
    await model.softwareId.validateAsync(softwareId)
    return await client.query(
        'DELETE FROM software_instances WHERE software_id = $1 AND access_token = $2',
        [softwareId, accessToken]
    )
}

module.exports = {
    findSoftwareInstance,
    findSoftwareInstanceByAccessToken,
    insertSoftwareInstance,
    deleteSoftwareInstances,
    deleteSoftwareInstance
}
