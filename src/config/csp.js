'use strict'

module.exports = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'data:', 'https:'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
    fontSrc: ["'self'", 'https:'],
    imgSrc: ["'self'", 'data:', 'https:'],
    frameSrc: ["'self'", 'data:', 'https:']
}
