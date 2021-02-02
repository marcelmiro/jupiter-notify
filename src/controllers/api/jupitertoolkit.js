'use strict'
const Joi = require('joi')
const { validate: uuidValidate } = require('uuid')
const { findSoftwareInstanceByAccessToken, insertSoftwareInstance } = require('../../database/repositories/software_instances')

const authorize = async (req, res) => {
    try {
        // Get request body parameters
        const { accessToken, hardwareId } = req.body
        // Validate accessToken using uuid validation function (as all accessTokens are uuids)
        if (!uuidValidate(accessToken)) return res.status(400).send({ message: 'Parameter validation failed.' })
        // Check if hardwareId is a string
        try {
            await Joi.string().required().validateAsync(hardwareId)
        } catch (e) { return res.status(400).send({ message: 'Parameter validation failed.' }) }

        // Get software instance object from database
        const softwareInstance = await findSoftwareInstanceByAccessToken({
            accessToken,
            softwareId: 'jupitertoolkit'
        })

        // If doesnt exist, save software instance
        if (!softwareInstance) {
            await insertSoftwareInstance({
                accessToken,
                softwareId: 'jupitertoolkit',
                instanceId: hardwareId
            })
            res.sendStatus(200)
        } else if (softwareInstance.instance_id === hardwareId) {
            // Check if hardwareId and instanceId are the same (meaning request is coming from same machine)
            res.sendStatus(200)
        } else {
            // This means that software instance exists but hardwareId is already bound to another machine.
            res.sendStatus(403)
        }
    } catch (e) {
        res.sendStatus(500)
        console.error(e)
    }
}

module.exports = { authorize }
