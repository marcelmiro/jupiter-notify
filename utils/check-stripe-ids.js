const dbUtils = require("./db-utils");
const stripeUtils = require("./stripe-utils");

dbUtils.getAllData("users").then(users => {
    for (const user of users) {
        stripeUtils.getCustomer(user.stripe_id).then(customer => {
            if (customer) console.debug(`Customer found for user '${user.username}'`);
            else {
                console.debug(`No customer found for user '${user.username}'`);
                changeId(user).then();
            }
        });
    }
});

let changeId = async user => {
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
