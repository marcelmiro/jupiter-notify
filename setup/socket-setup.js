require("dotenv").config();
const fs = require("fs");
const session = require("cookie-session")({
    name: "express:sess",
    keys: process.env.COOKIE_KEY.split(";")
});
const utils = require("../utils/utils");
const dbUtils = require("../utils/db-utils");
const stripeUtils = require("../utils/stripe-utils");
const botUtils = require("../utils/bot-utils");

module.exports = server => {
    const io = require("socket.io")(server);

    const TRUE_CONSOLE_LOG = console.log;
    console.log = msg => {
        TRUE_CONSOLE_LOG(msg);
        io.sockets.emit("get-logs");
    };
    const TRUE_CONSOLE_ERROR = console.error;
    console.error = msg => {
        TRUE_CONSOLE_ERROR(msg);
        io.sockets.emit("get-logs");
    };

    //  Authenticate user before connecting to socket.
    io.use(async (socket, next) => {
        //  Check if socket is in '/admin' route.
        if (socket.handshake.headers.referer !== process.env.URL + "/admin") { return; }

        //  Get user's cookie id.
        let req = { headers: { cookie: socket.handshake.headers.cookie } };
        session(req, {}, function() {});

        //  Get user's role from cookie id and authenticate user.
        const USER = req.session["passport"] ?
            await dbUtils.getData("users", "cookie_id", req.session["passport"].user) : undefined;
        const ROLE = USER ? await dbUtils.getRole(USER["user_id"]) : undefined;

        //  Allow connection if user's role allows admin panel and save user and role objects to socket.
        if (ROLE && "admin_panel" in ROLE["perms"] && ROLE["perms"]["admin_panel"]) {
            socket.request.user = USER;
            socket.request.role = ROLE;
            next();
        }
    });

    io.on("connection", socket => {
        //console.log(`User '${socket.request.user.username}' connected to socket.`);

        socket.on("disconnect", () => {
            //console.log(`User '${socket.request.user.username}' disconnected from socket.`);
        });

        //  Send updated member list.
        socket.on("get-member-list", async () => {
            try {
                const USERS = await dbUtils.getAllData("users");
                let userList = [];

                for (const user of USERS) {
                    const ROLE = await dbUtils.getRole(user["user_id"]);
                    if (ROLE) {
                        let temp = {
                            user_id: user["user_id"],
                            username: user.username,
                            role: { name: ROLE.name, color: ROLE.data.color },
                            avatar_url: user["avatar_url"]
                        };
                        temp.role.importance = "importance" in ROLE["perms"] ? ROLE["perms"].importance : 10;
                        userList.push(temp);
                    }
                }
                socket.emit("set-member-list", userList);
            } catch (e) {
                console.error(`Socket on 'get-member-list': ${e.message}`);
            }
        });

        //  Send member details.
        socket.on("get-member-details", async userId => {
            try {
                //  Check if user in db.
                const USER = await dbUtils.getData("users", "user_id", userId);
                if (!USER) { return socket.emit("send-error", "Can't find user in db."); }

                //  Create return object and modify object as needed.
                let data = {...USER, ...{
                        date_created: await utils.transformDate(new Date(USER.data["date_created"])),
                        user_in_server: Boolean(await botUtils.getUser(USER["user_id"]))
                    }};
                delete data.data;

                //  Get role object.
                const ROLE = await dbUtils.getRole(USER["user_id"]);
                if (ROLE) {
                    data = {...data, ...{ role: { name: ROLE.name, color: ROLE.data.color } }};
                }

                //  Get customer object and check if true.
                const CUSTOMER = await stripeUtils.getCustomer(USER["stripe_id"]);
                if (CUSTOMER) {
                    let temp = { default_payment: Boolean(CUSTOMER["invoice_settings"]["default_payment_method"]) };

                    //  Check if user has subscription
                    if (CUSTOMER.subscriptions.data.length > 0) {
                        temp["sub_id"] = CUSTOMER.subscriptions.data[0].id;
                        temp["sub_status"] = CUSTOMER.subscriptions.data[0].status;

                        //  Get invoice and check if true.
                        const INVOICE = await stripeUtils.getInvoice(CUSTOMER.subscriptions.data[0]["latest_invoice"]);
                        if (INVOICE) {
                            temp["invoice_id"] = INVOICE.id;
                            temp["invoice_status"] = INVOICE.status;
                            temp["invoice_date"] = await utils.transformDate(new Date(INVOICE.created * 1000));
                        }
                    }
                    data = {...data, ...temp};
                }

                socket.emit("set-member-details", data);
            } catch (e) {
                console.error(`Socket on 'get-member-details': ${e.message}`);
            }
        });

        //  Add member to db. (Must have logged in already).
        socket.on("add-member", async data => {
            try {
                //  Check if user exists in db. Check if user doesn't have a role already.
                const USER = await dbUtils.getData("users", "user_id", data["user_id"]);
                if (!USER) { return socket.emit("send-error", "User id doesn't exist in db."); }
                const USER_ROLE = Boolean(await dbUtils.getData("user_roles", "user_id", data["user_id"]));
                if (USER_ROLE) {
                    return socket.emit(
                        "send-error",
                        "User already has a role. Edit member if you want to change member's role."
                    );
                }

                //  Check if existing role name.
                const ROLES = await dbUtils.getAllData("roles");
                if (!ROLES.map(role=>role.name.toLowerCase()).includes(data.role.toLowerCase())) {
                    return socket.emit("send-error", "Role doesn't exist.");
                }

                //  Check role is not renewal (Renewals must pay for membership).
                if (data.role.toLowerCase() === "renewal") {
                    return socket.emit("send-error", "Can't add renewal member. Member must pay subscription.");
                }

                //  Get role.
                const ROLE = ROLES.find(role => role.name.toLowerCase() === data.role.toLowerCase());

                //  Check if u role importance is less than user's role
                //  (meaning someone e.g. staff can't add member to owner role).
                if (socket.request.role["perms"].importance > ROLE["perms"].importance) {
                    return socket.emit("send-error", "You can't add a member to a higher role than yours.");
                }

                //  If data inserted to 'user_roles' successfully, refresh member list and debug.
                if (await dbUtils.insertData("user_roles", [data["user_id"], ROLE["role_id"]])) {
                    io.sockets.emit("get-member-list");
                    socket.emit(
                        "send-message",
                        `User '${USER.username}' is now ${data.role[0].toUpperCase() + data.role.slice(1)}`
                    );
                }
            } catch (e) {
                console.error(`Socket on 'add-member': ${e.message}`);
            }
        });

        //  Delete member from 'user_roles' table.
        socket.on("delete-member", async userId => {
            try {
                //  Check if user exists.
                const USER = await dbUtils.getData("users", "user_id", userId);
                if (!USER) { return socket.emit("send-error", "User not found in db."); }

                //  Check if user has role.
                const ROLE = await dbUtils.getRole(userId);
                if (!ROLE) { return socket.emit("send-error", "User doesn't have a role."); }

                //  Get deleter and deleted importance.
                const IMPORTANCE_DELETER = socket.request.role["perms"].importance;
                const IMPORTANCE_DELETED = "importance" in ROLE["perms"] ? ROLE["perms"].importance : 10;

                //  Check if deleter has less importance than deleted.
                //  If deleter is 'god' or 'owner', check if deleter has less or equal importance than deleted.
                if (IMPORTANCE_DELETER > 2 && !(IMPORTANCE_DELETER < IMPORTANCE_DELETED) || !(IMPORTANCE_DELETER <= IMPORTANCE_DELETED)) {
                    let article = ["a", "e", "i", "o", "u"].indexOf(ROLE.name[0].toLowerCase()) > -1 ?
                        "an " + ROLE.name[0].toUpperCase() + ROLE.name.slice(1) :
                        "a " + ROLE.name[0].toUpperCase() + ROLE.name.slice(1);

                    return socket.emit("send-error", "You don't have permission to delete " + article);
                }

                //  If data deleted successfully, refresh member list and debug.
                if (await dbUtils.deleteData("user_roles", "user_id", userId)) {
                    io.sockets.emit("get-member-list");
                    socket.emit("send-message", `User '${USER.username}' has no role now.`);
                }
            } catch (e) {
                console.error(`Socket on 'delete-member': ${e.message}`);
            }
        });

        //  Get logs from log file.
        socket.on("get-logs", async () => {
            try {
                await new Promise((resolve, reject) => {
                    fs.readFile(process.env.LOGGER_NAME, 'utf8', (err, data) => {
                        if (err) { socket.emit("send-error", "Can't read logs."); reject(err); }
                        else { socket.emit("send-logs", data); resolve(data); }
                    });
                });
            } catch (e) {
                console.error(`Socket on 'get-logs': ${e.message}`);
            }
        });

        //  Get settings.
        socket.on("get-settings", async () => {
            try {
                let settings = {};
                const DB_SETTINGS = await dbUtils.getAllData("settings");
                DB_SETTINGS.forEach(setting => {
                    settings[setting.name] = setting.value;
                });
                socket.emit("set-settings", settings);
            } catch (e) {
                console.error(`Socket on 'get-settings': ${e.message}`);
            }
        });

        //  Update setting.
        socket.on("update-setting", async data => {
            try {
                //  Check if value is the same.
                if (data.value === process.env[data.name]) {
                    return socket.emit("send-error", "You're trying to update setting with same value.");
                }

                if (await dbUtils.updateSetting(data.name, data.value)) {
                    socket.emit("send-message", `Setting '${data.name}' has been updated.`);
                } else {
                    socket.emit("send-error", "Can't update setting.");
                }
            } catch (e) {
                console.error(`Socket on 'update-setting': ${e.message}`);
            }
        });
    });
};