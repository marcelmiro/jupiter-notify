require("dotenv").config();
const express = require('express');
const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const passportSetup = require("./setup/passport-setup");
const utils = require("./utils/utils");
const dbUtils = require("./utils/db-utils");

//  Init app and set port to '8080'.
const app = express();
const port = 8080;

//  Set express template to ejs and set default location of ejs files.
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '/static'));

//  Set cookie config.
app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys: [process.env.COOKIE_KEY]
}));

//  Set passport config and encode bodyParser to be able to carry jsons in body.
app.use(passport.initialize());
app.use(passport.session({
    secret: process.env.COOKIE_KEY,
    saveUninitialized: false,
    resave: false
}));
app.use(bodyParser.urlencoded({ extended: true }));

//  Check if browser is 'IE', then check if user has permission to access static files, then check for url.
app.use("/", utils.checkBrowser, utils.authStaticRoute, routes);
//  Serve static files.
app.use(express.static(__dirname + '/static'));
//  If url not found, redirect to home page.
app.use((req,res) => { res.redirect("/"); });

//  Checks if is hosted in localhost. If true, opens server with local ssl certs.
if (process.env.URL.includes("localhost")) {
    const https = require("https");
    const fs = require("fs");

    const httpsOptions = {
        key: fs.readFileSync("./ssl/localhost-key.pem"),
        cert: fs.readFileSync("./ssl/localhost-cert.pem")
    };

    https.createServer(httpsOptions, app).listen(port,() => {
        console.log("Server connected at:", port);
    });
} else {
    app.listen(port, () => {
        console.log("Server connect at:", port);
    });
}

//  Open postgres database.
dbUtils.openDb().then(() => {
    //dbUtils.getAllData("roles").then(console.log);
});
// TODO Close database on exit
