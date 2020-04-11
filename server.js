require("dotenv").config();
const express = require('express');
const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const passportSetup = require("./setup/passport-setup");
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", routes);
app.use(express.static(__dirname + '/static'));

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

dbUtils.openDb().then(() => {
    //dbUtils.getAllData("roles").then(console.log);
});
// TODO Close database on exit
