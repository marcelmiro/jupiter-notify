'use strict'
const passport = require('passport')
const DiscordStrategy = require('passport-discord')
const { keys: secret } = require('./cookies')
const { findUserByCookie } = require('../database/repositories/users')
const { loginUser } = require('../services/users')

passport.serializeUser((user, done) => done(null, user.cookie_id))
passport.deserializeUser((id, done) => findUserByCookie(id).then(user => done(null, user)))

passport.use(new DiscordStrategy(
    {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: '/login/redirect'
    },

    /**
     * Callback function
     * @param accessToken - String
     * @param refreshToken - String
     * @param profile - profile{id:String, username:String, avatar:String, discriminator:String, email:String,
     *                  locale:String, mfa_enabled:Boolean, flags:Integer, provider:String, accessToken:String,
     *                  fetchedAt:Date}
     * @param done
     */
    (accessToken, refreshToken, profile, done) => {
        const { id, username, discriminator, email, avatar } = profile
        const avatarUrl = avatar
            ? `https://cdn.discordapp.com/avatars/${id}/${avatar}?size=2048`
            : 'https://cdn.discordapp.com/embed/avatars/1.png?size=2048'

        loginUser({ userId: id, username: `${username}#${discriminator}`, email, avatarUrl })
            .then(user => done(null, user))
            .catch(console.error)
    }
))

module.exports = {
    secret,
    saveUninitialized: false,
    resave: false
}
