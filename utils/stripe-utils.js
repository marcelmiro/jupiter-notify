const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


let createStripeCustomer = async (email, userId= undefined, name= undefined) => {
    return await new Promise(async (resolve, reject) => {
        let obj = {email:email};
        userId ? obj["description"] = userId : "";
        name ? obj["name"] = name : "";

        await stripe.customers.create(
            obj,(err, customer) => {
                if (err) { console.log(err); reject(); }
                else {
                    console.log(`Customer '${email}' inserted into database.`);
                    resolve(customer.id);
                }
            }
        )
    });
};

let updateStripeCustomer = async (id, data = {}) => {
    return await new Promise(async (resolve, reject) => {
        await stripe.customers.update(
            id, data, (err, customer) => {
                if (err) { console.log(err.message); reject(err); }
                else {
                    console.log(`Stripe customer '${customer.id}' updated.`);
                    resolve(customer);
                }
            });
    });
};

let createStripeSubscription = async id => {
    await stripe.subscriptions.create(
        {
            customer: id,
            items: [{plan: process.env.STRIPE_PLAN_ID}],
        }, (err, subscription) => {
            if (err) { console.log(err); return false; }
            else { return true; }
        }
    )
};

let updateStripeSubscription = async (id, data = {}) => {
    return await new Promise(async (resolve, reject) => {
        await stripe.subscriptions.update(
            id, data, (err, subscription) => {
                if (err) { console.log(err.message); reject(err); }
                else {
                    console.log(`Stripe subscription '${subscription.id}' updated.`);
                    resolve(subscription);
                }
            });
    });
};

let deleteStripeSubscription = async id => {
    return await new Promise(async (resolve, reject) => {
        await stripe.subscriptions.del(
            id, (err, confirmation) => {
                if (err) { console.log(err.message); reject(err); }
                else {
                    console.log(`Stripe subscription '${id}' deleted.`);
                    resolve(confirmation);
                }
            }
        );
    });
};

let createSession = async customerId => {
    return await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        subscription_data: {
            items: [{
                plan: process.env.STRIPE_PLAN_ID,
            }],
        },
        success_url: `${process.env.URL}/stripe/success?session_id={CHECKOUT_SESSION_ID}&customer_id=${customerId}`,
        cancel_url: `${process.env.URL}/stripe/fail`,
    });
};

async function getAllCustomers() {
    try {
        return (await stripe.customers.list()).data;
    } catch (e) {
        console.log("Error in getAllCustomers():", e.message);
    }
}

let getCustomer = async id => {
    return await new Promise(async (resolve, reject) => {
        await stripe.customers.retrieve(
            id, (err, customer) => {
                if (err) { console.log(err); reject(err); }
                else { resolve(customer); }
            }
        )
    });
};

let getSubscription = async id => {
    return await new Promise(async (resolve, reject) => {
        await stripe.subscriptions.retrieve(
            id, (err, subscription) => {
                if (err) { console.log(err.message); reject(err); }
                else { resolve(subscription); }
            }
        )
    });
};

let getPaymentMethod = async id => {
    return await new Promise(async (resolve, reject) => {
        await stripe.paymentMethods.retrieve(
            id, (err, paymentMethod) => {
                if (err) { console.log(err.message); reject(err); }
                else { resolve(paymentMethod); }
            }
        );
    });
};

let createWebhook = async (body, signature) => {
    return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_ID);
};


module.exports = {createStripeCustomer, updateStripeCustomer,
    createStripeSubscription, updateStripeSubscription, deleteStripeSubscription,
    createSession, getAllCustomers, getCustomer, getSubscription, getPaymentMethod, createWebhook};
