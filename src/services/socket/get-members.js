'use strict'
const { listUsersAndRolesFromUserRoles } = require('../../database/repositories/user-roles')
const { checkPermission } = require('../permissions')

module.exports = async socket => {
    try {
        if (!await checkPermission(socket.request.role.role_id, 'members', 'r')) return

        const users = []
        const dbUsers = await listUsersAndRolesFromUserRoles()
        if (!dbUsers) return socket.emit('send-error', 'Error on fetching members from database.')

        for (const user of dbUsers) {
            users.push({
                userId: user.user_id,
                username: user.username,
                stripeId: user.stripe_id,
                email: user.email,
                avatarUrl: user.avatar_url,
                role: {
                    name: user.name,
                    importance: user.importance || 1000,
                    color: user.color || undefined
                }
            })
        }

        socket.emit('set-members', users)
    } catch (e) {
        socket.emit('send-error', 'Internal server error: ' + e.message)
        console.error(e)
    }
}
