require("dotenv").config();

//  Function to check log file size and remove some old logs if file size exceeds stated amount.
const fs = require("fs");
function clearLog() {
    fs.stat(process.env.LOGGER_NAME, (err, stats) => {
        if (err) console.error("fs.stat(): Can't read log file.");
        else if (stats.size > parseInt(process.env.LOGGER_MAX_SIZE) * 1000) {
            fs.readFile(process.env.LOGGER_NAME, 'utf8', (err, data) => {
                if (err) { console.error("fs.readFile(): Can't read log file."); }
                else {
                    let newLines = parseInt(process.env.LOGGER_NEW_LINES);
                    data = data.split("\n");
                    data = data.length > newLines ?
                        data.slice(data.length - newLines) : data.slice(data.length - data.length/2);
                    fs.writeFile(process.env.LOGGER_NAME, "\n".join(data), err => {
                        if (err) { console.error("fs.writeFile(): Can't write in log file."); }
                    });
                }
            });
        }
    });
}
//  Setup logger and override default logging functions.
const log = require("simple-node-logger").createSimpleLogger({
    logFilePath: process.env.LOGGER_NAME,
    timestampFormat: 'YYYY-MM-DD HH:mm:ss'
});
console.log = msg => { log.info(msg); clearLog(); };
console.error = msg => { log.error(msg); clearLog(); };


const express = require('express');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");

const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

const dbUtils = require("./utils/db-utils");
dbUtils.openDb().then();
dbUtils.setSettings().then(() => {
    const utils = require("./utils/utils");
    const routes = require("./routes/routes");
    const passportSetup = require("./setup/passport-setup");

    //  Init app and set port either to env number or number by default '8080'.
    const app = express();
    const port = process.env.PORT || 8080;

    //  Set express template to ejs and set default location of ejs files.
    app.set("view engine", "ejs");
    app.set('views', path.join(__dirname, '/static'));

    //  Set helmet and rate limit config.
    app.use(helmet());
    app.set('trust proxy', 1);
    app.use(rateLimit({
        windowMs: 60 * 1000,
        max: 400
    }));

    //  Set cookie config.
    app.use(cookieSession({
        maxAge: 24*60*60*1000,
        keys: process.env.COOKIE_KEY.split(";")
    }));

    //  Set passport config and encode bodyParser to be able to carry jsons in body.
    app.use(passport.initialize());
    app.use(passport.session({
        secret: process.env.COOKIE_KEY.split(";"),
        saveUninitialized: false,
        resave: false
    }));
    app.use(bodyParser.urlencoded({ extended: true }));

    //  Check if browser is 'IE', then check if user has permission to access static files, then check for url.
    app.use("/", utils.checkBrowser, utils.authStaticRoute, routes);
    //  Serve static files.
    app.use(express.static(__dirname + '/static'));
    app.use(express.static(__dirname + '/node_modules/vue/dist'));
    app.use(express.static(__dirname + '/node_modules/socket.io-client/dist'));
    //  If url not found, redirect to home page.
    app.use((req,res) => { res.redirect("/"); });

    //  Create server depending on if local or on heroku, for https.
    let server = process.env.URL.includes("localhost") ?
        require("https").createServer({
            key: fs.readFileSync("./ssl/localhost-key.pem"),
            cert: fs.readFileSync("./ssl/localhost-cert.pem")
        }, app) : require("http").createServer(app);

    //  Listen to server and setup socket connections.
    server.listen(port,() => {
        console.log(`Server connected at: ${port}`);
    });
    require("./setup/socket-setup")(server).then();
});