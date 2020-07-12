'use strict'
const { name, keys } = require('../../config/cookies')
const session = require('cookie-session')({
    name: name,
    keys: keys
})
const { findUserByCookie } = require('../../database/repositories/users')
const { findRoleFromUserRole } = require('../../database/repositories/user-roles')

module.exports = io => {
    io.use(async (socket, next) => {
        // Check if socket is in '/admin' route.
        if (socket.handshake.headers.referer !== process.env.URL + '/admin') return

        // Get user's cookie id.
        const req = { headers: { cookie: socket.handshake.headers.cookie } }
        session(req, {}, function () {})

        // Get user's role from cookie id and authenticate user.
        const USER = req.session.passport?.user
            ? await findUserByCookie(req.session.passport.user)
            : undefined
        const ROLE = USER ? await findRoleFromUserRole(USER.user_id) : undefined

        // Allow connection if user's role has admin panel perms
        // and save user and role objects to socket.
        if (ROLE?.['admin_panel']) {
            socket.request.user = USER
            socket.request.role = ROLE
            next()
        }
    })
}
