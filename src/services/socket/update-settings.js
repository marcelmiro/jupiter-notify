'use strict'
const Joi = require('joi')
const { emitSocket } = require('./')
const { listSettings, updateSetting } = require('../../database/repositories/settings')
const { checkPermission } = require('../permissions')

module.exports = async (socket, settings) => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'settings', 'u')) {
            return socket.emit('send-error', 'You don\'t have permission to edit a setting.')
        }

        const settingList = []
        if (settings) {
            for (const [key, value] of Object.entries(settings)) {
                if (!value) continue
                for (const setting of value) {
                    if (key.toLowerCase() !== 'general') setting.name = key.toUpperCase() + ' ' + setting.name
                    setting.name = setting.name.split(' ').join('_')
                    setting.value = setting.value?.toString().trim() || undefined
                    settingList.push(setting)
                }
            }
        }

        try {
            await Joi.array().items(Joi.object().keys({
                name: Joi.string().required(),
                value: Joi.string(),
                type: Joi.string().required()
            })).required().validateAsync(settingList)
        } catch (e) {
            return socket.emit('send-error', 'Parameter validation failed: ' + e.message)
        }

        /* if (!(await findSetting(name))) return socket.emit('send-error', 'Setting name doesn\'t exist.')
        if (value === process.env[name]) return socket.emit('send-error', 'Setting already has the same value.')
        if (name.toLowerCase() === 'in_stock' && (await getRelease())?.stock) return socket.emit('send-error', 'A release is running therefore you can\'t update this setting.')

        if (await updateSettings(name, value)) {
            console.log(`User '${socket.request.user.username}' has updated '${name}' setting.`)
            socket.emit('send-message', 'Setting value updated.')
        } else socket.emit('send-error', 'Couldn\'t update setting.') */

        const dbSettings = await listSettings()
        if (!dbSettings) return socket.emit('send-error', 'Error on fetching settings from database.')

        for (const setting of settingList) {
            const dbSetting = dbSettings.find(dbSetting => dbSetting.name === setting.name)
            if (!dbSetting) continue

            if ((setting.value || dbSetting.value) && setting.value !== dbSetting.value) {
                console.debug(setting.name)
                if (await updateSetting(setting.name, setting.value)) {
                    console.log(`User '${socket.request.user.username}' updated setting '${name}'.`)
                } else return socket.emit('send-error', 'Error on updating setting from database.')
            }
        }

        await emitSocket('get-settings')
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
