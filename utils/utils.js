require("dotenv").config();
const { uuid } = require('uuidv4');
const browser = require("browser-detect");
const dbUtils = require("./db-utils");
const stripeUtils = require("./stripe-utils");


//  Check if browser is not IE.
let checkBrowser = (req, res, next) => {
    browser(req.headers['user-agent']).name === "ie" ? res.render("ie") : next();
};

//  Authenticate static files.
const STATIC_SETTINGS = {
    subscription: ["dashboard."],
    admin: ["admin.", "vue.js", "socket.io.js"]
}
let authStaticRoute = async (req, res, next) => {
    try {
        //  If route not included in list, skip rest of code.
        if (![...STATIC_SETTINGS.subscription, ...STATIC_SETTINGS.admin].filter(route => req.path.includes(route)).length > 0) {
            return next();
        }
        //  User must be logged in for all routes in list.
        else if (!req.user) return res.redirect("/");
        //  Subscription routes.
        else if (STATIC_SETTINGS.subscription.filter(route => req.path.includes(route)).length > 0) {
            const CUSTOMER = await stripeUtils.getCustomer(req.user.stripe_id);
            const HAS_MEMBERSHIP = Boolean(CUSTOMER.subscriptions.data.length > 0);
            const ROLE = await dbUtils.getRole(req.user.user_id);

            if (!HAS_MEMBERSHIP && (!ROLE || ROLE.name === "renewal")) return res.redirect("/");
        //  Admin routes.
        } else if (STATIC_SETTINGS.admin.filter(route => req.path.includes(route)).length > 0) {
            const ROLE = await dbUtils.getRole(req.user.user_id);
            if (!ROLE?.["perms"]?.admin_panel) return res.redirect("/");
        }
        next();
    } catch (e) {
        console.error(`authStaticRoute(): ${e.message}`);
        return false;
    }
};

//  Function that runs every time someone logs in through Discord.
//  Function checks if user already in db and compares data to change if difference, else, creates new user in db.
let userLogin = async (userId, username, email, avatarUrl) => {
    try {
        //  Validate parameters.
        const PARAMS = [userId, username, email];
        if (PARAMS.filter(n => {return n}).length < PARAMS.length) {
            if (!userId) console.error("userLogin(): Parameter 'userId' is undefined.");
            else if (!username) console.error("userLogin(): Parameter 'username' is undefined.");
            else if (!email) console.error("userLogin(): Parameter 'email' is undefined.");
            else console.error("userLogin(): At least 1 parameter is undefined.");
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
                await stripeUtils.updateCustomer(DB_DATA.stripe_id, {email: email});
                console.log(`Email for user '${username}' changed.`);
            }
            if (DB_DATA.avatar_url !== avatarUrl) {
                hasChanged = true;
                await dbUtils.updateData("users", "user_id", userId, "avatar_url", avatarUrl);
                console.log(`Avatar for user '${username}' changed.`);
            }
            //  Get stripe id from db. Check if customer doesn't exist or customer's description doesn't equal 'userId'.
            //  If so, check if stripe customer with 'userId' exists. If so, update db 'stripe_id'.
            //  Else, create new customer with login data.
            const DB_CUSTOMER = await stripeUtils.getCustomer(DB_DATA.stripe_id);
            if (!DB_CUSTOMER || DB_CUSTOMER.description !== userId) {
                const CUSTOMERS = await stripeUtils.getAllCustomers();
                const CUSTOMER = CUSTOMERS.find(customer => customer.description === userId);
                if (CUSTOMER) {
                    await dbUtils.updateData("users", "user_id", userId, "stripe_id", CUSTOMER.id);
                    console.log(`Stripe id for user '${username}' changed.`);
                } else {
                    const STRIPE_ID = await stripeUtils.createCustomer(email, userId, username);
                    await dbUtils.updateData("users", "user_id", userId, "stripe_id", STRIPE_ID);
                    console.log(`Couldn't find customer linked to '${username}', so created new stripe customer.`);
                }
            }


            if (!hasChanged) console.log(`User '${username}' logged in.`);
            return DB_DATA;
        } else {    //  Code to create user.
            //Create stripe customer.
            let stripeId;
            const CUSTOMERS = await stripeUtils.getAllCustomers();
            if (CUSTOMERS.map(a=>a.description).includes(userId)) {
                stripeId = CUSTOMERS.filter(a => a.description === userId)[0].id;
                console.log(`Customer '${username}' is already in stripe.`);
            } else {
                stripeId = await stripeUtils.createCustomer(email, userId, username);
            }

            //  Insert user in db.
            if (await dbUtils.insertData("users",
                [userId, uuid(), stripeId, username, email, avatarUrl, {date_created: (new Date()).valueOf()}])) {
                console.log(`User '${username}' inserted in db.`);
                return await dbUtils.getData("users", "user_id", userId);
            } else {
                console.log("Error in userLogin() when inserting user in db.");
            }
        }
    } catch (e) {
        console.error(`userLogin(): ${e.message}`);
        return false;
    }
};

//  Input date object and return string in format 'dd/mm/yyyy'.
let transformDate = async date => {
    try {
        //  Validate parameter 'date'.
        if (!date || date.toString().toLowerCase() === "invalid date") {
            console.error("transformDate(): Parameter 'date' is undefined.");
            return undefined;
        }

        const DAY = date.getDate(), MONTH = date.getMonth()+1, YEAR = date.getFullYear();
        return (DAY.toString().length === 1 ? "0"+DAY : DAY) + "/" +
            (MONTH.toString().length === 1 ? "0"+MONTH : MONTH) + "/" + YEAR;
    } catch (e) {
        console.error(`transformDate(): ${e.message}`);
        return undefined;
    }
};

//  Function to create limited amount of renewal stock with 'number'.
let createRelease = async number => {
    //  Validate parameter 'number'.
    if (!number || isNaN(parseInt(number))) {
        console.error("createRelease(): Parameter 'number' is undefined.");
        return false;
    }

    process.env.IN_STOCK = "true";
    process.env.RELEASE_STOCK = number.toString();
    return true;
};

module.exports = { checkBrowser, authStaticRoute, userLogin, transformDate, createRelease };