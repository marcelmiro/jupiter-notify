'use strict'
const { listUsersAndRolesFromUserRoles } = require('../../database/repositories/user-roles')

module.exports = async socket => {
    try {
        if (!socket.request.role?.admin_panel) return socket.disconnect()

        const userList = []
        const USERS = await listUsersAndRolesFromUserRoles()

        for (const user of USERS) {
            userList.push({
                userId: user.user_id,
                username: user.username,
                avatarUrl: user.avatar_url,
                role: {
                    name: user.name,
                    importance: user.importance || 10,
                    color: user.color
                }
            })
        }

        socket.emit('set-member-list', userList)
    } catch (e) {
        console.error(e)
    }
}
