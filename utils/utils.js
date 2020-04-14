const { uuid } = require('uuidv4');
const browser = require("browser-detect");
const dbUtils = require("./db-utils");
const stripeUtils = require("./stripe-utils");


//  Check if browser is not IE.
let checkBrowser = (req, res, next) => {
    if (browser(req.headers['user-agent']).name === "ie") {
        res.render("ie");
    } else {
        next();
    }
};

//  Authenticate static files
let authStaticRoute = async (req, res, next) => {
    if (!req.path.includes("/dashboard.") && !req.path.includes("/admin.")) { return next(); }
    else if (!req.user) { return res.redirect("/"); }
    else if (req.path.includes("/dashboard.")) {
        const CUSTOMER = await stripeUtils.getCustomer(req.user["stripe_id"]);
        const HAS_MEMBERSHIP = Boolean(CUSTOMER.subscriptions.data.length > 0);
        const ROLE = await dbUtils.getRole(req.user["user_id"]);
        if (!HAS_MEMBERSHIP && !ROLE) {
            return res.redirect("/");
        } else if (!HAS_MEMBERSHIP && (ROLE.name === "renewal" || ROLE.name === "lifetime")) {
            return res.redirect("/");
        }
    } else if (req.path.includes("/admin.")) {
        const ROLE = await dbUtils.getRole(req.user["user_id"]);
        if (!ROLE || !("admin_panel" in ROLE["perms"]) || !ROLE["perms"]["admin_panel"]) {
            return res.redirect("/");
        }
    }
    next();
};

//  Function that runs every time someone logs in through Discord.
//  Function checks if user already in db and compares data to change if difference, else, creates new user in db.
let userLogin = async (userId, username, email, avatarUrl) => {
    const PARAMS = [userId, username, email];
    if (PARAMS.filter(n => {return n}).length < PARAMS.length) {
        console.log("userLogin() parameters are undefined.");
        return false;
    }
    const DB_DATA = await dbUtils.getData("users", "user_id", userId);
    if (DB_DATA) {  //  User exists in db.
        //  Check if data is different and change it if so.
        let hasChanged = false;
        if (DB_DATA.username !== username) {
            hasChanged = true;
            await dbUtils.updateData("users", "user_id", userId, "username", username);
            console.log(`Username for user '${username}' changed.`);
        }
        if (DB_DATA.email !== email) {
            hasChanged = true;
            await dbUtils.updateData("users", "user_id", userId, "email", email);
            await stripeUtils.updateStripeCustomer(DB_DATA["stripe_id"], {email: email});
            console.log(`Email for user '${username}' changed.`);
        }
        if (DB_DATA.avatar_url !== avatarUrl) {
            hasChanged = true;
            await dbUtils.updateData("users", "user_id", userId, "avatar_url", avatarUrl);
            console.log(`Avatar for user '${username}' changed.`);
        }
        //  Check if stripe customer exists linked to this user. If not, create customer with user data.
        const CUSTOMERS = await stripeUtils.getAllCustomers();
        if (!CUSTOMERS.map(a=>a.description).includes(userId)) {
            const STRIPE_ID = await stripeUtils.createStripeCustomer(email, userId, username);
            await dbUtils.updateData("users", "user_id", userId, "stripe_id", STRIPE_ID);
            console.log(`Couldn't find customer linked to '${username}', so created '${STRIPE_ID}' stripe customer.`);
        }

        if (!hasChanged) {
            console.log(`User '${username}' logged in.`);
        }
        return DB_DATA;
    } else {    //  Code to create user.
        //Create stripe customer.
        let stripeId;
        const CUSTOMERS = await stripeUtils.getAllCustomers();
        if (CUSTOMERS.map(a=>a.description).includes(userId)) {
            stripeId = CUSTOMERS.filter(a => a.description === userId)[0].id;
            console.log(`Customer '${username}' is already in stripe.`);
        } else {
            stripeId = await stripeUtils.createStripeCustomer(email, userId, username);
        }

        //  Insert user in db.
        if (await dbUtils.insertData("users",
            [userId, uuid(), stripeId, username, email, avatarUrl, {date_created: (new Date()).valueOf()}])) {
            return await dbUtils.getData("users", "user_id", userId);
        } else {
            console.log("Error in userLogin() when inserting user in db.");
        }
    }
};

//  Input date object and return string in format 'dd/mm/yyyy'.
let transformDate = async (date) => {
    const DAY = date.getDate(), MONTH = date.getMonth()+1, YEAR = date.getFullYear();
    return (DAY.toString().length === 1 ? "0"+DAY : DAY) + "/" +
        (MONTH.toString().length === 1 ? "0"+MONTH : MONTH) + "/" + YEAR;
};

module.exports = {checkBrowser, authStaticRoute, userLogin, transformDate};