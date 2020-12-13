'use strict'
const { listRoles } = require('../../database/repositories/roles')
const { checkPermission } = require('../permissions')

module.exports = async socket => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'roles', 'r')) return

        const roles = []
        const dbRoles = await listRoles()
        if (!dbRoles) return socket.emit('send-error', 'Error on fetching roles from database.')

        for (const role of dbRoles) {
            if (!role.role_id || !role.name) continue

            roles.push({
                id: role.role_id,
                name: role.name,
                color: role.color || undefined,
                discordId: role.discord_id || undefined,
                transferable: role.transferable || false,
                permissions: {
                    administrator: role.administrator || false,
                    importance: role.importance || undefined,
                    stats: role.stats || undefined,
                    members: role.members || undefined,
                    roles: role.roles || undefined,
                    restocks: role.restocks || undefined,
                    products: role.products || undefined,
                    logs: role.logs || undefined,
                    settings: role.settings || undefined
                }
            })
        }

        socket.emit('set-roles', roles)
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
