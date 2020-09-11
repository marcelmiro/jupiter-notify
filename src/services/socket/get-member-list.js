'use strict'
const { listUsersAndRolesFromUserRoles } = require('../../database/repositories/user-roles')

module.exports = async socket => {
    try {
        if (!socket.request.role?.['admin_panel']) return socket.disconnect()

        const userList = []
        const USERS = await listUsersAndRolesFromUserRoles()

        USERS.forEach(user => {
            userList.push({
                userId: user.user_id,
                username: user.username,
                avatarUrl: user.avatar_url
                    ? user.avatar_url.includes('.png')
                        ? user.avatar_url
                        : user.avatar_url.slice(0, user.avatar_url.indexOf('?size=')) + '.png' +
                        user.avatar_url.slice(user.avatar_url.indexOf('?size='))
                    : 'https://cdn.discordapp.com/embed/avatars/1.png?size=2048',
                role: {
                    name: user.name,
                    importance: user.importance || 10,
                    color: user.color
                }
            })
        })

        socket.emit('set-member-list', userList)
    } catch (e) {
        console.error(e)
    }
}
