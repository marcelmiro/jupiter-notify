const dbUtils = require("./db-utils");
const stripeUtils = require("./stripe-utils");

// ASYNC/AWAIT ERROR CATCHER
const catchAsyncErrors = fn => (
    (req, res, next) => {
        const routePromise = fn(req, res, next);
        if (routePromise.catch) {
            routePromise.catch(err => next(err));
        }
    }
);


let userLogin = async (userId, username, email, data= undefined) => {
    const PARAMS = [userId, username, email];
    if (PARAMS.filter(n => {return n}).length < PARAMS.length) {
        console.log("userLogin() parameters are undefined.");
        return false;
    }
    const DB_DATA = await dbUtils.getData("user_id", userId);
    if (DB_DATA) {
        data = encodeURI(JSON.stringify(data));

        let hasChanged = false;
        if (DB_DATA.username !== username) {
            hasChanged = true;
            await dbUtils.updateData("user_id", userId, "username", username);
            console.log(`Username for user '${username}' changed.`);
        }
        if (DB_DATA.email !== email) {
            hasChanged = true;
            await dbUtils.updateData("user_id", userId, "email", email);
            await stripeUtils.updateStripeCustomer(DB_DATA["stripe_id"], {email: email});
            console.log(`Email for user '${username}' changed.`);
        }
        const CUSTOMERS = await stripeUtils.getAllCustomers();
        if (!CUSTOMERS.map(a=>a.description).includes(userId)) {
            const STRIPE_ID = await stripeUtils.createStripeCustomer(email, userId, username);
            await dbUtils.updateData("user_id", userId, "stripe_id", STRIPE_ID);
            console.log(`Couldn't find customer so created '${STRIPE_ID}' stripe customer.`);
        }
        DB_DATA.data = await getFromDataAndUpdate(userId, data);
        if (!hasChanged) {
            console.log(`User '${username}' is already in the database.`);
        }
        return DB_DATA;
    } else {
        if (!data) {
            data =
                {
                    "avatar_url": "https://cdn.discordapp.com/embed/avatars/1.png?size=2048",
                    "has_membership": false,
                };
            data = encodeURI(JSON.stringify(data));
        } else {
            data = await getFromData(data, {"has_membership": false});
        }

        let stripeId;
        const CUSTOMERS = await stripeUtils.getAllCustomers();
        if (CUSTOMERS.map(a=>a.description).includes(userId)) {
            stripeId = CUSTOMERS.filter(a => a.description === userId)[0].id;
            console.log(`Customer '${username}' is already in stripe.`);
        } else {
            stripeId = await stripeUtils.createStripeCustomer(email, userId, username);
        }

        if (await dbUtils.insertUser(userId, username, email, stripeId, data)) {
            return await dbUtils.getData("user_id", userId);
        } else {
            console.log("Error in userLogin() when inserting user in db.");
        }
    }
};

let getFromData = async (dbData, newData) => {
    try {
        if (typeof dbData === "string") {
            dbData = JSON.parse(decodeURI(dbData));
        }
        if (typeof newData === "string") {
            newData = JSON.parse(decodeURI(newData));
        }
        return encodeURI(JSON.stringify({...dbData, ...newData}));
    } catch (e) {
        console.log(e.message);
        return false;
    }
};

let getFromDataAndUpdate = async (user_id, newData) => {
    const DB_DATA = (await dbUtils.getData("user_id", user_id))["data"];
    const DATA = await getFromData(DB_DATA, newData);
    if (!DATA) { console.log("getFromDataAndUpdate() error"); }
    else {
        await dbUtils.updateData("user_id", user_id, "data", DATA);
        return DATA;
    }
};

let transformDate = async (date) => {
    const DAY = date.getDate(), MONTH = date.getMonth()+1, YEAR = date.getFullYear();
    return (DAY.toString().length === 1 ? "0"+DAY : DAY) + "/" +
        (MONTH.toString().length === 1 ? "0"+MONTH : MONTH) + "/" + YEAR;
};

module.exports = {catchAsyncErrors, userLogin, getFromData, getFromDataAndUpdate, transformDate};