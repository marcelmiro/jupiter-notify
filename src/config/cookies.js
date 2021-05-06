'use strict'

module.exports = {
    name: 'express:sess',
    keys: process.env.COOKIE_KEY?.split(';'),
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 Week
}
