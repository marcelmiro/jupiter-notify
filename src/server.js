'use strict'
require('dotenv').config()
const express = require('express')
const path = require('path')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cookieSession = require('cookie-session')
const passport = require('passport')
const bodyParser = require('body-parser')
const compression = require('compression')

require('./services/logger')
require('./config')().then(() => {
    const csp = require('./config/csp')
    const { trustProxy, windowMs, max: maxRequests } = require('./config/rate-limit')
    const { keys: cookieKeys, maxAge } = require('./config/cookies')
    const { secret, saveUninitialized, resave } = require('./config/passport')
    const { key: sslKey, cert: sslCert } = require('./config/ssl')
    const { checkIEBrowser, verifyRoute } = require('./utils')

    const app = express()
    const port = process.env.PORT || 8080

    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, '/views'))

    app.use(helmet())
    app.use(helmet.contentSecurityPolicy({ directives: csp }))
    app.set('trust proxy', trustProxy)
    app.use(rateLimit({ windowMs, max: maxRequests }))

    app.use(cookieSession({ keys: cookieKeys, maxAge }))

    app.use(passport.initialize())
    app.use(passport.session({ secret, saveUninitialized, resave }))

    app.use(compression())
    app.use(bodyParser.urlencoded({ extended: true }))

    // Static files.
    app.use(express.static(path.join(__dirname, '/public')))
    app.use('/js', express.static(path.join(__dirname, '../node_modules/vue/dist')))
    app.use('/js', express.static(path.join(__dirname, '../node_modules/socket.io-client/dist')))

    // Routes & fallback function.
    app.use('/', checkIEBrowser, verifyRoute, require('./routes'))
    app.use((err, req, res, next) => {
        console.error(err)
        res.redirect('/')
    })

    const server = sslKey && sslCert
        ? require('https').createServer({ key: sslKey, cert: sslCert }, app)
        : require('http').createServer(app)
    server.listen(port, () => console.log('Server connected at: ' + port))

    require('./config/socket')(server).then(io => require('./services/socket')(io))
    require('./services/stripe/check-renewals')()
})
