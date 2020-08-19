require('dotenv').config()
require('./services/logger')
require('./config')().then(() => {
    const express = require('express')
    const path = require('path')
    const helmet = require('helmet')
    const rateLimit = require('express-rate-limit')
    const cookieSession = require('cookie-session')
    const passport = require('passport')
    const bodyParser = require('body-parser')

    const app = express()
    const port = process.env.PORT || 8080

    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, '/static'))

    const { trustProxy, windowMs, max } = require('./config/rate-limit')
    app.use(helmet())
    app.set('trust proxy', trustProxy)
    app.use(rateLimit({ windowMs, max }))

    const { keys, maxAge } = require('./config/cookies')
    app.use(cookieSession({ keys, maxAge }))

    const { secret, saveUninitialized, resave } = require('./config/passport')
    app.use(passport.initialize())
    app.use(passport.session({ secret, saveUninitialized, resave }))

    app.use(bodyParser.urlencoded({ extended: true }))

    const { checkIEBrowser, verifyRoute } = require('./utils')
    app.use('/', checkIEBrowser, verifyRoute, require('./routes'))
    app.use(express.static(path.join(__dirname, '/static')))
    app.use(express.static(path.join(__dirname, '/node_modules/vue/dist')))
    app.use(express.static(path.join(__dirname, '/node_modules/socket.io-client/dist')))
    app.use((req, res) => res.redirect('/'))

    const { key, cert } = require('./config/ssl')
    const server = key && cert
        ? require('https').createServer({ key, cert }, app)
        : require('http').createServer(app)

    server.listen(port, () => console.log('Server connected at: ' + port))
    require('./config/socket')(server).then(io => require('./services/socket')(io))
})
