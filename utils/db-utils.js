require('dotenv').config();
const Client = require("pg").Client;
const { uuid } = require('uuidv4');

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
    try {
        db = new Client(process.env.DATABASE_URL);
        await db.connect();
        console.log("Database has been opened.");
        return true;
    } catch (e) {
        console.log("Error in openDb():", e.message);
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
        console.log("Error in closeDb():", e.message);
        return false;
    }
}

async function getAllData() {
    try {
        //return await db.all("SELECT * FROM user_data");
        return (await db.query("SELECT * FROM user_data")).rows;
    } catch (e) {
        console.log("Error in getAllData():", e.message);
        return undefined;
    }
}

let getData = async (field, exactMatch) => {
    try {
        //return await db.get(`SELECT * FROM user_data WHERE ${field}="${exactMatch}"`);
        return (await db.query(`SELECT * FROM user_data WHERE ${field}='${exactMatch}'`)).rows[0];
    } catch (e) {
        console.log("Error in getData():", e.message);
        return undefined;
    }
};

let insertUser = async (userId, username, email, stripeId, data) => {
    try {
        //await db.run(`INSERT INTO user_data VALUES("${userId}", "${username}", "${email}", "${uuid()}", "${stripeId}", '${data}')`);
        await db.query(`INSERT INTO user_data VALUES('${userId}', '${username}', '${email}', '${uuid()}', '${stripeId}', '${data}')`);
        console.log(`User '${username}' inserted into database.`);
        return true;
    } catch (e) {
        console.log("Error in insertUser():", e.message);
        return false;
    }
};

let deleteUser = async userId => {
    try {
        const { username } = await getData("user_id", userId);
        //await db.run(`DELETE FROM user_data WHERE user_id="${userId}"`);
        await db.query(`DELETE FROM user_data WHERE user_id='${userId}'`);

        console.log(`User '${username}' deleted from database.`);
        return true;
    } catch (e) {
        console.log("Error in deleteUser():", e.message);
        return false;
    }
};

let updateData = async (matchField, matchValue, changeField, newValue) => {
    try {
        //await db.run(`UPDATE user_data SET ${changeField}="${newValue}" WHERE ${matchField}='${matchValue}'`);
        await db.query(`UPDATE user_data SET ${changeField}='${newValue}' WHERE ${matchField}='${matchValue}'`);
        return true;
    } catch (e) {
        console.log("Error in updateData():", e.message);
        return false;
    }
};

module.exports = {openDb, closeDb, getAllData, getData, insertUser, deleteUser, updateData};
