'use strict';

require('dotenv').config();

var express = require('express');

var path = require('path');

var helmet = require('helmet');

var rateLimit = require('express-rate-limit');

var cookieSession = require('cookie-session');

var passport = require('passport');

var bodyParser = require('body-parser');

var compression = require('compression');

require('regenerator-runtime/runtime');

require('./services/logger');

require('./config')().then(function () {
  var csp = require('./config/csp');

  var _require = require('./config/rate-limit'),
      trustProxy = _require.trustProxy,
      windowMs = _require.windowMs,
      maxRequests = _require.max;

  var _require2 = require('./config/cookies'),
      cookieKeys = _require2.keys,
      maxAge = _require2.maxAge;

  var _require3 = require('./config/passport'),
      secret = _require3.secret,
      saveUninitialized = _require3.saveUninitialized,
      resave = _require3.resave;

  var _require4 = require('./config/ssl'),
      sslKey = _require4.key,
      sslCert = _require4.cert;

  var _require5 = require('./utils'),
      checkIEBrowser = _require5.checkIEBrowser,
      verifyRoute = _require5.verifyRoute;

  var app = express();
  var port = process.env.PORT || 8080;
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '/views'));
  app.use(helmet());
  app.use(helmet.contentSecurityPolicy({
    directives: csp
  }));
  app.set('trust proxy', trustProxy);
  app.use(rateLimit({
    windowMs: windowMs,
    max: maxRequests
  }));
  app.use(cookieSession({
    keys: cookieKeys,
    maxAge: maxAge
  }));
  app.use(passport.initialize());
  app.use(passport.session({
    secret: secret,
    saveUninitialized: saveUninitialized,
    resave: resave
  }));
  app.use(compression());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(express["static"](path.join(__dirname, '/public')));
  app.use('/js', express["static"](path.join(__dirname, '../node_modules/vue/dist')));
  app.use('/js', express["static"](path.join(__dirname, '../node_modules/socket.io-client/dist')));
  app.use('/', checkIEBrowser, verifyRoute, require('./routes'));
  app.use(function (err, req, res, next) {
    console.error(err);
    res.redirect('/');
  });
  var server = sslKey && sslCert ? require('https').createServer({
    key: sslKey,
    cert: sslCert
  }, app) : require('http').createServer(app);
  server.listen(port, function () {
    return console.log('Server connected at: ' + port);
  });

  require('./config/socket')(server).then(function (io) {
    return require('./services/socket')(io);
  });

  require('./services/stripe/check-renewals')();
});