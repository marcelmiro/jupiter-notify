const dbUtils = require("./db-utils");
const stripeUtils = require("./stripe-utils");

dbUtils.getAllData("users").then(users => {
    startLoop(users).then(() => console.debug("Scan stripe customers finished"));
});

let startLoop = async users => {
    for (const user of users) {
        await checkCustomer(user);
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let checkCustomer = async user => {
    let customer = await stripeUtils.getCustomer(user.stripe_id);
    if (customer) console.debug(`Stripe found for user '${user.username}'`);
    else {
        console.debug(`No customer found for user '${user.username}'`);
        changeCustomer(user).then();
    }
    await sleep(500);
};

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
