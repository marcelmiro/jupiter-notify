'use strict'
const { listSettings } = require('../../database/repositories/settings')
const { checkPermission } = require('../permissions')

module.exports = async socket => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'settings', 'r')) return

        const settings = {}
        let dbSettings = await listSettings()
        if (!dbSettings) return socket.emit('send-error', 'Error on fetching settings from database.')
        dbSettings = dbSettings.filter(setting => setting.name !== 'IN_STOCK')

        const names = dbSettings.map(setting => setting.name).map(name => name.split('_')[0])
        const duplicateNames = names.filter(
            (name, index, array) => array.indexOf(name) === index && array.lastIndexOf(name) !== index
        ).sort()

        for (const name of ['general', ...duplicateNames]) settings[name.toLowerCase()] = []
        for (const setting of dbSettings) {
            const category = setting.name.split('_')[0].toLowerCase()
            if (Object.keys(settings).includes(category)) {
                setting.name = setting.name.split('_').slice(1).join(' ')
                settings[category].push(setting)
            } else {
                setting.name = setting.name.split('_').join(' ')
                settings.general.push(setting)
            }
        }

        socket.emit('set-settings', settings)
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
