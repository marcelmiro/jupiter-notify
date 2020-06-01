const dbUtils = require("./db-utils");
const stripeUtils = require("./stripe-utils");


let changeCustomer = async user => {
    const CUSTOMERS = await stripeUtils.getAllCustomers();
    const CUSTOMER = CUSTOMERS.find(customer => customer.description === user.user_id);
    if (CUSTOMER) {
        await dbUtils.updateData("users", "user_id", user.user_id, "stripe_id", CUSTOMER.id);
        console.log(`Stripe id for user '${user.username}' changed.`);
    } else {
        const STRIPE_ID = await stripeUtils.createCustomer(user.email, user.user_id, user.username);
        await dbUtils.updateData("users", "user_id", user.user_id, "stripe_id", STRIPE_ID);
        console.log(`Couldn't find customer linked to '${user.username}' so created new stripe customer.`);
    }
};

let scan = async () => {
    try {
        const USERS = await dbUtils.getAllData("users");
        for (const user of USERS) {
            const CUSTOMER = await stripeUtils.getCustomer(user.stripe_id);
            if (CUSTOMER) console.debug(`Customer found for user '${user.username}'`);
            else {
                console.debug(`No customer found for user '${user.username}'`);
                changeCustomer(user).then();
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }
        console.log("Scan stripe customers finished");
    } catch (e) {
        console.error("scan(): Error on scanning stripe customer ids.");
    }
};

module.exports = scan;
//require("./utils/check-stripe-ids")().then();
