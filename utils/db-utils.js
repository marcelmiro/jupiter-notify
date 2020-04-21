require('dotenv').config();
const Client = require("pg").Client;

let db = undefined;
let openDb = async () => {
    try {
        db = new Client(process.env.DATABASE_URL);
        await db.connect();
        console.log("Database has been opened.");
        return true;
    } catch (e) {
        console.error(`openDb(): ${e.message}`);
        return false;
    }
};

async function closeDb() {
    try {
        await db.end();
        console.log("Database was closed.");
        return true;
    } catch (e) {
        console.error(`closeDb(): ${e.message}`);
        return false;
    }
}

async function getAllData(table) {
    try {
        return (await db.query(`SELECT * FROM ${table}`)).rows;
    } catch (e) {
        console.error(`getAllData(): ${e.message}`);
        return undefined;
    }
}

let getData = async (table, field, exactMatch) => {
    try {
        return (await db.query(`SELECT * FROM ${table} WHERE ${field}='${exactMatch}'`)).rows[0];
    } catch (e) {
        console.error(`getData(): ${e.message}`);
        return undefined;
    }
};

let getRole = async userId => {
    try {
        const USER_ROLE = await getData("user_roles", "user_id", userId);
        if (USER_ROLE) {
            return await getData("roles", "role_id", USER_ROLE["role_id"]);
        } else {
            return undefined;
        }
    } catch (e) {
        console.error(`getRole(): ${e.message}`);
        return undefined;
    }
};

let insertData = async (table, data= []) => {
    try {
        //  Data array must have at least 1 value.
        if (!(data.length > 0)) {
            return false;
        }
        //  Object values must be converted to string to show correctly in a string.
        data.forEach((entry, index) => {
            if (typeof entry === "object") {
                data[index] = JSON.stringify(entry);
            }
        });

        //  Add data to table. Check if table is equal to 'roles', as 'role_id'
        //  column must be ignored to add default value to it.
        if (table === "roles") {
            await db.query(`INSERT INTO roles (name, perms, data) VALUES('${data.join("', '")}')`);
        } else {
            await db.query(`INSERT INTO ${table} VALUES('${data.join("', '")}')`);
        }

        //  Debugging and return.
        //console.log(`Data inserted into '${table}'.`);
        return true;
    } catch (e) {
        console.error(`insertData(): ${e.message}`);
        return false;
    }
};

let deleteData = async (table, field, value) => {
    try {
        //  SQL query to delete row.
        await db.query(`DELETE FROM ${table} WHERE ${field}='${value}'`);

        //  Debugging and return.
        //console.log(`Data in field '${field}' and value '${value}', deleted successfully from table '${table}'.`);
        return true;
    } catch (e) {
        console.error(`deleteData(): ${e.message}`);
        return false;
    }
};

let updateData = async (table, matchField, matchValue, changeField, newValue) => {
    try {
        //  Check if new value is object, and convert to string if so.
        if (typeof newValue === "object") {
            newValue = JSON.stringify(newValue);
        }

        //  Check if row exists.
        if (await getData(table, matchField, matchValue)) {
            return false;
        }

        //  Update db row and return.
        await db.query(`UPDATE ${table} SET ${changeField}='${newValue}' WHERE ${matchField}='${matchValue}'`);
        return true;
    } catch (e) {
        console.error(`updateData(): ${e.message}`);
        return false;
    }
};

let setSettings = async () => {
    try {
        const SETTINGS = (await db.query(`SELECT * FROM settings`)).rows;
        SETTINGS.forEach(row => {
            process.env[row.name] = row.value;
        });
        return true;
    } catch (e) {
        console.error(`setSettings(): ${e.message}`);
        return false;
    }
};

let updateSetting = async (name, value) => {
    try {
        await updateData("settings", "name", name, "value", value);
        process.env[name] = value;
        return true;
    } catch (e) {
        console.error(`updateSetting(): ${e.message}`);
        return false;
    }
};

//  Update data if row exists, else insert into table.
//  Unfinished function (If insert, should also contain 'matchValue' and in correct position).
/*let updateOrInsertData = async (table, matchField, matchValue, data= {}) => {
    try {
        if (await getData(table, matchField, matchValue)) {
            Object.entries(data).forEach(([key, value]) => {
                updateData(table, matchField, matchValue, key, value).then();
            });
            console.log("Data updated.");
        } else {
            await insertData(table, Object.values(data).unshift(matchValue));
            console.log("Data inserted.");
        }
    } catch (e) {
        console.error(`updateOrInsertData(): ${e.message}`);
    }
};*/

//  TODO Create function to add param to users 'data' object without overriding.

module.exports = {openDb, closeDb, getAllData, getData, getRole,
    insertData, deleteData, updateData, setSettings, updateSetting};
