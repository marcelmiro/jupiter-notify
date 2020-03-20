require('dotenv').config();
const Client = require("pg").Client;
const { uuid } = require('uuidv4');
const stripeUtils = require("./stripe-utils");

let db;
/*async function openDb() {
    try {
        db = await sql.open(process.env.DB_LOCATION, sql.OPEN_READWRITE);
        console.log("Database has been opened.");
        return true;
    } catch (e) {
        try {
            db = await sql.open(process.env.DB_LOCATION, sql.OPEN_CREATE);
            return true;
        } catch (e2) {
            console.log("Error 1:", e, "\nError 2:", e2);
        }
        return false;
    }
}*/
async function openDb() {
    db = new Client({
        user: "tpgooilyhjvcdo",
        password: "3beac1a7d1cf31083858fe17ffa606b19d3f5f3d2cf1d9f99ed823d14b084309",
        host: "ec2-54-246-90-10.eu-west-1.compute.amazonaws.com",
        port: 5432,
        database: "df0g3cc96374vq"
    });

    try {
        await db.connect();
        console.log("Database has been opened.");
        return true;
    } catch (e) {
        console.log(e.message);
        return false;
    }
}

async function closeDb() {
    try {
        //await db.close();
        await db.end();
        console.log("Database was closed.");
        return true;
    } catch (e) {
        console.log(e.message);
        return false;
    }
}

async function getAllData() {
    try {
        //return await db.all("SELECT * FROM user_data");
        return (await db.query("SELECT * FROM user_data")).rows;
    } catch (e) {
        console.log(e.message);
        return undefined;
    }
}

let getData = async (field, exactMatch) => {
    try {
        //return await db.get(`SELECT * FROM user_data WHERE ${field}="${exactMatch}"`);
        return (await db.query(`SELECT * FROM user_data WHERE ${field}='${exactMatch}'`)).rows[0];
    } catch (e) {
        console.log(e.message);
        return undefined;
    }
};

let existsUser = async user_id => {
    try {
        //return Boolean(await db.get(`SELECT * FROM user_data WHERE EXISTS(SELECT 1 FROM user_data WHERE user_id="${user_id}")`));
        return Boolean((await db.query(`SELECT * FROM user_data WHERE EXISTS(SELECT 1 FROM user_data WHERE user_id='${user_id}')`)).rows.length > 0);
    } catch (e) {
        console.log(e.message);
        return false;
    }
};

let insertUser = async (user_id, username, email, data) => {
    try {
        let stripe_id;
        try {
            stripe_id = await stripeUtils.createStripeCustomer(email, user_id, username);
        } catch (e) {
            console.log(e.message);
            return false;
        }

        //await db.run(`INSERT INTO user_data VALUES("${user_id}", "${username}", "${email}", "${uuid()}", "${stripe_id}", '${data}')`);
        await db.query(`INSERT INTO user_data VALUES('${user_id}', '${username}', '${email}', '${uuid()}', '${stripe_id}', '${data}')`);
        console.log(`User '${username}' inserted into database.`);
        return true;
    } catch (e) {
        console.log(e.message);
        return false;
    }
};

let deleteUser = async user_id => {
    try {
        const { username } = await getData("user_id", user_id);
        //await db.run(`DELETE FROM user_data WHERE user_id="${user_id}"`);
        await db.query(`DELETE FROM user_data WHERE user_id='${user_id}'`);

        console.log(`User '${username}' deleted from database.`);
        return true;
    } catch (e) {
        console.log(e.message);
        return false;
    }
};

let updateData = async (matchField, matchValue, changeField, newValue) => {
    try {
        //await db.run(`UPDATE user_data SET ${changeField}="${newValue}" WHERE ${matchField}='${matchValue}'`);
        await db.query(`UPDATE user_data SET ${changeField}='${newValue}' WHERE ${matchField}='${matchValue}'`);
        return true;
    } catch (e) {
        console.log(e.message);
        return false;
    }
};

module.exports = {openDb, closeDb, getAllData, getData, existsUser, insertUser, deleteUser, updateData};
