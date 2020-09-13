'use strict'
const client = require('../../config/database')
const model = require('../models/software_ids')

const findSoftwareId = async id => {
    await model.softwareId.validateAsync(id)
    return (
        await client.query('SELECT * FROM software_ids WHERE software_id = $1 LIMIT 1', [id])
    ).rows[0]
}

module.exports = { findSoftwareId }
