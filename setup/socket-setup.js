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


let setup = async server => {
    const io = require("socket.io")(server);

    //  Override log functions and emit when logging.
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
        const ROLE = USER ? await dbUtils.getRole(USER.user_id) : undefined;

        //  Allow connection if user's role allows admin panel and save user and role objects to socket.
        if (ROLE?.["perms"]?.admin_panel) {
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
                //  Check if user has permission.
                const ROLE = await dbUtils.getRole(socket.request.user.user_id);
                if (!ROLE?.["perms"]?.admin_panel) {
                    return socket.disconnect();
                }

                const USERS = await dbUtils.getAllData("users");
                let userList = [];

                for (const user of USERS) {
                    //  Add png extension to avatars that don't have it (So giffs are converted to png).
                    user.avatar_url = user.avatar_url.includes(".png") ? user.avatar_url :
                        user.avatar_url.slice(0, user.avatar_url.indexOf("?size=")) + ".png" +
                        user.avatar_url.slice(user.avatar_url.indexOf("?size="));

                    //  Get user's role and if true, push to members list.
                    const ROLE = await dbUtils.getRole(user.user_id);
                    if (ROLE) {
                        let temp = {
                            user_id: user.user_id,
                            username: user.username,
                            role: { name: ROLE.name, color: ROLE.data.color },
                            avatar_url: user.avatar_url
                        };
                        temp.role.importance = ROLE["perms"]?.importance ? ROLE["perms"].importance : 10;
                        userList.push(temp);
                    }
                }
                socket.emit("set-member-list", userList);
            } catch (e) {
                console.error(`Socket on 'get-member-list': ${e.message}`);
                socket.emit("send-error", "Error when trying to get members list.");
            }
        });

        //  Send member details.
        socket.on("get-member-details", async userId => {
            try {
                //  Check if user has permission.
                if (!socket.request.role?.["perms"]?.["view_members"]) {
                    return socket.emit("send-error", "You don't have permission to view a member's details.");
                }

                //  Check if user in db.
                const USER = await dbUtils.getData("users", "user_id", userId);
                if (!USER) { return socket.emit("send-error", "Can't find user in db."); }

                //  Create return object and modify object as needed.
                let data = {...USER, ...{
                        date_created: await utils.transformDate(new Date(USER.data.date_created)),
                        user_in_server: Boolean(await botUtils.getUser(USER.user_id))
                    }};
                delete data.data;

                //  Get role object.
                const ROLE = await dbUtils.getRole(USER.user_id);
                if (ROLE) {
                    data = {...data, ...{ role: { name: ROLE.name, color: ROLE.data.color } }};
                }

                //  Get customer object and check if true.
                const CUSTOMER = await stripeUtils.getCustomer(USER.stripe_id);
                if (CUSTOMER) {
                    let temp = { default_payment: Boolean(CUSTOMER.invoice_settings?.default_payment_method) };

                    //  Check if user has subscription.
                    if (CUSTOMER.subscriptions.data.length > 0) {
                        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0];

                        temp.sub_id = SUBSCRIPTION.id;
                        temp.sub_status = SUBSCRIPTION.status;

                        //  Get invoice and check if true.
                        const INVOICE = SUBSCRIPTION.latest_invoice ? await stripeUtils.getInvoice(SUBSCRIPTION.latest_invoice) : undefined;
                        if (INVOICE?.id) {
                            temp.invoice_id = INVOICE.id;
                            temp.invoice_status = INVOICE.status;
                            temp.invoice_date = await utils.transformDate(new Date(INVOICE.created * 1000));
                        }
                    }
                    data = {...data, ...temp};
                }

                socket.emit("set-member-details", data);
            } catch (e) {
                console.error(`Socket on 'get-member-details': ${e.message}`);
                socket.emit("send-error", "Error on getting member's details.");
            }
        });

        //  Add member to db. (Must have logged in already).
        socket.on("add-member", async ({ user_id: userId, role: role }) => {
            try {
                //  Check if user has permission.
                if (!socket.request.role?.["perms"]?.["modify_members"]) {
                    return socket.emit("send-error", "You don't have permission to add a member.");
                }

                //  Check if user exists in db. Check if user doesn't have a role already.
                const USER = await dbUtils.getData("users", "user_id", userId);
                if (!USER) { return socket.emit("send-error", "User id doesn't exist in db."); }
                const USER_ROLE = Boolean(await dbUtils.getData("user_roles", "user_id", userId));
                if (USER_ROLE) {
                    return socket.emit(
                        "send-error",
                        "User already has a role. Edit member if you want to change member's role."
                    );
                }

                //  Check if existing role name.
                const ROLES = await dbUtils.getAllData("roles");
                if (!ROLES.map(role=>role.name.toLowerCase()).includes(role.toLowerCase())) {
                    return socket.emit("send-error", "Role doesn't exist.");
                }

                //  Check role is not renewal (Renewals must pay for membership).
                if (role.toLowerCase() === "renewal") {
                    return socket.emit("send-error", "Can't add renewal member. Member must pay subscription.");
                }

                //  Get role.
                const ROLE = ROLES.find(role => role.name.toLowerCase() === role.toLowerCase());

                //  Check if u role importance is less than user's role
                //  (meaning someone e.g. staff can't add member to owner role).
                if (socket.request.role["perms"].importance > ROLE["perms"].importance) {
                    return socket.emit("send-error", "You can't add a member to a higher role than yours.");
                }

                //  If data inserted to 'user_roles' successfully, refresh member list and debug.
                if (await dbUtils.insertData("user_roles", [userId, ROLE["role_id"]])) {
                    const USER = await dbUtils.getData("users", "user_id", userId);
                    if (USER) {
                        console.log(`User '${USER.username}' now has ${role[0].toUpperCase() + role.slice(1)} role.`);
                    }
                    io.sockets.emit("get-member-list");
                    socket.emit(
                        "send-message",
                        `User '${USER.username}' is now ${role[0].toUpperCase() + role.slice(1)}`
                    );
                }
            } catch (e) {
                console.error(`Socket on 'add-member': ${e.message}`);
                socket.emit("send-error", "Error when trying to add member.");
            }
        });

        //  Delete member from 'user_roles' table.
        socket.on("delete-member", async userId => {
            try {
                //  Check if user has permission.
                if (!socket.request.role?.["perms"]?.["modify_members"]) {
                    return socket.emit("send-error", "You don't have permission to delete a member.");
                }

                //  Check if user exists.
                const USER = await dbUtils.getData("users", "user_id", userId);
                if (!USER) { return socket.emit("send-error", "User not found in db."); }

                //  Check if user has role.
                const ROLE = await dbUtils.getRole(userId);
                if (!ROLE) { return socket.emit("send-error", "User doesn't have a role."); }

                //  Get deleter and deleted importance.
                const IMPORTANCE_DELETER = socket.request.role["perms"].importance;
                const IMPORTANCE_DELETED = ROLE["perms"]?.importance ? ROLE["perms"].importance : 10;

                //  Check if deleter has less importance than deleted.
                //  If deleter is 'god' or 'owner', check if deleter has less or equal importance than deleted.
                if (IMPORTANCE_DELETER > 2 && IMPORTANCE_DELETER >= IMPORTANCE_DELETED || IMPORTANCE_DELETER > IMPORTANCE_DELETED) {
                    let article = ["a", "e", "i", "o", "u"].indexOf(ROLE.name[0].toLowerCase()) > -1 ?
                        "an " + ROLE.name[0].toUpperCase() + ROLE.name.slice(1) :
                        "a " + ROLE.name[0].toUpperCase() + ROLE.name.slice(1);

                    return socket.emit("send-error", "You don't have permission to delete " + article);
                }

                //  If data deleted successfully, refresh member list and debug.
                if (await dbUtils.deleteData("user_roles", "user_id", userId)) {
                    console.log(`User '${socket.request.user.username}' has delete user '${USER.username}'.`);
                    await botUtils.kickUser(userId, USER.email);
                    io.sockets.emit("get-member-list");
                    socket.emit("send-message", `User '${USER.username}' has no role now.`);
                }
            } catch (e) {
                console.error(`Socket on 'delete-member': ${e.message}`);
                socket.emit("send-error", "Error when trying to delete member.");
            }
        });

        //  Get current stock release.
        socket.on("get-release", () => {
            //  Check if user has permission.
            if (!socket.request.role?.["perms"]?.["create_releases"]) {
                return false;
            }

            //  Check if setting is still a number. Therefore any number (including 0) will give false,
            //  while undefined will return true.
            if (isNaN(parseInt(process.env.RELEASE_REMAINING_STOCK))) {
                return socket.emit("set-release", {});
            }

            socket.emit("set-release", {
                active: Boolean(process.env.IN_STOCK.toLowerCase() === "true"),
                total: parseInt(process.env.RELEASE_TOTAL_STOCK),
                remaining: parseInt(process.env.RELEASE_REMAINING_STOCK)
            });
        });

        //  Create release of renewal licenses, based on the input number.
        socket.on("create-release", number => {
            try {
                //  Check if user has permission.
                if (!socket.request.role?.["perms"]?.["create_releases"]) {
                    return socket.emit("send-error", "You don't have permission to create a stock release.");
                }

                //  Validate input param.
                if (!number || isNaN(number)) {
                    return socket.emit("send-error", "Input was not a number.");
                } else if (parseInt(number) <= 0) {
                    return socket.emit("send-error", "Input must be greater than 0.");
                }

                if (parseInt(process.env.RELEASE_REMAINING_STOCK) > 0) {
                    return socket.emit("send-error", "A release is already running. Stop it if you want to create a new one.");
                }

                //  Create and change settings.
                process.env.RELEASE_TOTAL_STOCK = parseInt(number).toString();
                process.env.RELEASE_REMAINING_STOCK = parseInt(number).toString();
                process.env.IN_STOCK = "true";

                //  Debug and return.
                console.log(`User '${socket.request.user.username}' has released ${number} renewal license${parseInt(number) > 1 ? "s" : ""}.`);
                io.sockets.emit("get-release");
                socket.emit("send-message", "Renewal stock released.");
            } catch (e) {
                console.error(`Socket on 'create-release': ${e.message}`);
                socket.emit("send-error", "Error when trying to create stock release.");
            }
        });

        //  Delete release of renewal licenses.
        socket.on("delete-release", () => {
            try {
                //  Check if user has permission.
                if (!socket.request.role?.["perms"]?.["create_releases"]) {
                    return socket.emit("send-error", "You don't have permission to create a stock release.");
                }

                //  Check if release exists.
                if (isNaN(parseInt(process.env.RELEASE_REMAINING_STOCK)) || parseInt(process.env.RELEASE_REMAINING_STOCK) <= 0) {
                    return socket.emit("send-error", "Can't stop a non-existing release.");
                }

                //  Edit and delete settings.
                process.env.IN_STOCK = "false";
                delete process.env.RELEASE_TOTAL_STOCK
                delete process.env.RELEASE_REMAINING_STOCK;

                //  Debug and return.
                console.log(`User '${socket.request.user.username}' has stopped release.`);
                io.sockets.emit("get-release");
                socket.emit("send-message", "Release has been stopped.");
            } catch (e) {
                console.error(`Socket on 'delete-release': ${e.message}`);
                socket.emit("send-error", "Error when trying to delete release.");
            }
        });

        //  Get logs from log file.
        socket.on("get-logs", async () => {
            try {
                //  Check if user has permission.
                if (!socket.request.role?.["perms"]?.["view_console"]) {
                    return false;
                }

                //  Read logger file and return data.
                await new Promise((resolve, reject) => {
                    fs.readFile(process.env.LOGGER_NAME, 'utf8', (err, data) => {
                        if (err) { socket.emit("send-error", "Can't read logs."); reject(err); }
                        else { socket.emit("send-logs", data); resolve(data); }
                    });
                });
            } catch (e) {
                console.error(`Socket on 'get-logs': ${e.message}`);
                socket.emit("send-error", "Error when getting logs.");
            }
        });

        //  Get settings.
        socket.on("get-settings", async () => {
            try {
                //  Check if user has permission.
                if (!socket.request.role?.["perms"]?.["edit_config"]) {
                    return false;
                }

                let settings = {};
                const DB_SETTINGS = await dbUtils.getAllData("settings");
                DB_SETTINGS.forEach(({ name }) => {
                    settings[name] = process.env[name];
                });
                socket.emit("set-settings", settings);
            } catch (e) {
                console.error(`Socket on 'get-settings': ${e.message}`);
                socket.emit("send-error", "Error when getting settings.");
            }
        });

        //  Update setting.
        socket.on("update-setting", async ({ name: name, value: value }) => {
            try {
                //  Check if user has permission.
                if (!socket.request.role?.["perms"]?.["edit_config"]) {
                    return socket.emit("send-error", "You don't have permission to edit settings.");
                }

                //  Validate inputs.
                if (!(await dbUtils.getData("settings", "name", name)) || !value) {
                    return socket.emit("send-error", "Couldn't find setting or value was not accepted.");
                }

                //  Check if value is the same.
                if (value === process.env[name]) {
                    return socket.emit("send-error", "You're trying to update setting with same value.");
                }

                //  Deny access to change 'IN_STOCK' if release running.
                if (name === "IN_STOCK" && process.env.RELEASE_REMAINING_STOCK) {
                    return socket.emit("send-error", "A stock release is running right now, so you can't edit this setting.");
                }

                if (await dbUtils.updateSetting(name, value)) {
                    console.log(`User '${socket.request.user.username}' has updated '${name}' setting.`);
                    socket.emit("send-message", `Setting '${name}' has been updated.`);
                } else {
                    socket.emit("send-error", "Can't update setting.");
                }
            } catch (e) {
                console.error(`Socket on 'update-setting': ${e.message}`);
                socket.emit("send-error", "Error when trying to update a setting.");
            }
        });
    });
}


module.exports = setup;