'use strict'
const { validate: uuidValidate, v4: uuidv4 } = require('uuid')
const { findSoftwareId } = require('../../database/repositories/software_ids')
const { findAccessTokenByToken } = require('../../database/repositories/access_tokens')
const { findSoftwareInstanceByAccessToken, insertSoftwareInstance } = require('../../database/repositories/software_instances')
const { encrypt } = require('../../utils/encryption')

const authorize = async (req, res) => {
    try {
        const { softwareId, accessToken } = req.body
        if (
            !uuidValidate(softwareId) ||
            !uuidValidate(accessToken)
        ) return res.status(400).send({ message: 'Parameter validation failed.' })

        const SOFTWARE_ID = await findSoftwareId(softwareId)
        const ACCESS_TOKEN = SOFTWARE_ID ? await findAccessTokenByToken(accessToken) : undefined
        if (
            !ACCESS_TOKEN ||
            await findSoftwareInstanceByAccessToken({ softwareId, accessToken })
        ) return res.status(403).send({ message: 'Parameter verification failed.' })

        const instanceId = uuidv4()
        const softwareToken = await encrypt({
            iv: ACCESS_TOKEN.iv,
            text: JSON.stringify({ softwareId, instanceId })
        })

        if (
            !softwareToken ||
            !(await insertSoftwareInstance({ accessToken, softwareId, instanceId }))
        ) return res.sendStatus(500)

        res.status(200).send({ accessToken, softwareToken })
    } catch (e) {
        res.sendStatus(500)
        console.error(e)
    }
}

module.exports = { authorize }
