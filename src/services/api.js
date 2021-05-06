'use strict'
const { validate: uuidValidate } = require('uuid')
const { findAccessTokenByToken } = require('../database/repositories/access_tokens')
const { findSoftwareId } = require('../database/repositories/software_ids')
const { findSoftwareInstance } = require('../database/repositories/software_instances')
const { decrypt } = require('../utils/encryption')

const authenticate = async ({ path, accessToken, softwareToken }) => {
    if (
        !uuidValidate(accessToken) ||
        typeof softwareToken !== 'string' ||
        typeof path !== 'string'
    ) return

    const ACCESS_TOKEN_OBJECT = await findAccessTokenByToken(accessToken)
    if (!ACCESS_TOKEN_OBJECT) return
    const { iv } = ACCESS_TOKEN_OBJECT

    const DECRYPTED_SOFTWARE_TOKEN = JSON.parse(await decrypt({ iv, text: softwareToken }))
    if (!DECRYPTED_SOFTWARE_TOKEN) return
    const { softwareId, instanceId } = DECRYPTED_SOFTWARE_TOKEN
    if (!softwareId || !instanceId) return

    const SOFTWARE_ID_OBJECT = await findSoftwareId(softwareId)
    const PATH_SOFTWARE_NAME = path.split('/').filter(Boolean)[1]
    if (
        !SOFTWARE_ID_OBJECT ||
        !PATH_SOFTWARE_NAME ||
        SOFTWARE_ID_OBJECT.name.toLowerCase() !== PATH_SOFTWARE_NAME.toLowerCase()
    ) return

    const SOFTWARE_INSTANCE_OBJECT = await findSoftwareInstance(instanceId)
    if (
        !SOFTWARE_INSTANCE_OBJECT ||
        SOFTWARE_INSTANCE_OBJECT.access_token !== accessToken ||
        SOFTWARE_INSTANCE_OBJECT.software_id !== softwareId
    ) return

    return true
}

module.exports = { authenticate }
