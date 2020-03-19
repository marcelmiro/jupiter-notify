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


let userLogin = async (user_id, username, email, data= undefined) => {
    const PARAMS = [user_id, username, email];
    if (PARAMS.filter(n => {return n}).length < PARAMS.length) {
        console.log("userLogin() parameters are undefined.");
        return false;
    }

    const DB_DATA = await dbUtils.getData("user_id", user_id);
    if (DB_DATA) {
        data = encodeURI(JSON.stringify(data));

        let hasChanged = false;
        if (DB_DATA.username !== username) {
            hasChanged = true;
            await dbUtils.updateData("user_id", user_id, "username", username);
            console.log(`Username for user '${username}' changed.`);
        }
        if (DB_DATA.email !== email) {
            hasChanged = true;
            await dbUtils.updateData("user_id", user_id, "email", email);
            await stripeUtils.updateStripeEmail(DB_DATA["stripe_id"], email);
            console.log(`Email for user '${username}' changed.`);
        }
        DB_DATA.data = await getFromData(DB_DATA.data, data);
        if (!hasChanged) {
            console.log(`User '${username}' is already in the database.`);
        }
        return DB_DATA;
    } else {
        if (!data) {
            data =
                {
                    "avatar_url": "https://via.placeholder.com/2048",
                    "has_membership": false,
                };
            data = encodeURI(JSON.stringify(data));
        } else {
            data = await getFromData(data, {"has_membership": false});
        }
        if (await dbUtils.insertUser(user_id, username, email, data)) {
            return await dbUtils.getData("user_id", user_id);
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
    if (!DATA) { console.log("getFromDataAndUpdate() error"); return false; }
    else {
        await dbUtils.updateData("user_id", user_id, "data", DATA);
        return true;
    }
};


module.exports = {catchAsyncErrors, userLogin, getFromData, getFromDataAndUpdate};
