require("dotenv").config();
const express = require('express');
const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");
const routes = require("./routes");
const passportSetup = require("./passport-setup");
const utils = require("./utils/utils");
const dbUtils = require("./utils/db-utils");


const app = express();
const port = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '/static'));

app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys: [process.env.COOKIE_KEY]
}));

app.use(passport.initialize());
app.use(passport.session({
    secret: process.env.COOKIE_KEY,
    saveUninitialized: false,
    resave: false
}));
app.use("/", routes);
app.use(express.static(__dirname + '/static'));

if (process.env.URL.includes("localhost")) {
    const https = require("https");
    const fs = require("fs");

    const httpsOptions = {
        key: fs.readFileSync("./ssl/localhost-key.pem"),
        cert: fs.readFileSync("./ssl/localhost-cert.pem")
    };

    https.createServer(httpsOptions, app).listen(port, _ => {
        console.log("Server connected at:", port);
    });
} else {
    app.listen(port, _ => {
        console.log("Server connect at:", port);
    });
}

dbUtils.openDb().then(_ => {

});
// TODO Close database on exit
//dbUtils.closeDb();
