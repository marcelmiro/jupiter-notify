'use strict'
const { listUsers } = require('../../database/repositories/users')
const { findRoleFromUserRole } = require('../../database/repositories/user-roles')

module.exports = async socket => {
    try {
        if (!socket.request.role?.['admin_panel']) return socket.disconnect()

        const userList = []
        const USERS = await listUsers()

        for (const user of USERS) {
            user.avatar_url = user.avatar_url.includes('.png')
                ? user.avatar_url
                : user.avatar_url.slice(0, user.avatar_url.indexOf('?size=')) + '.png' +
                user.avatar_url.slice(user.avatar_url.indexOf('?size='))

            const role = await findRoleFromUserRole(user.user_id)
            if (!role) continue

            userList.push({
                userId: user.user_id,
                username: user.username,
                avatarUrl: user.avatar_url,
                role: {
                    name: role.name,
                    importance: role.importance || 10,
                    color: role.color
                }
            })
        }

        socket.emit('set-member-list', userList)
    } catch (e) {
        console.error('Socket \'get-member-list\': ' + e.message)
        socket.emit('send-error', 'Error in socket \'get-member-list\'.')
    }
}
