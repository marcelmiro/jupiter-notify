require("dotenv").config();
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
                else { resolve(customer); }
            });
    });
};

let updateStripeSubscription = async (id, data = {}) => {
    return await new Promise(async (resolve, reject) => {
        await stripe.subscriptions.update(
            id, data, (err, subscription) => {
                if (err) { console.log(err.message); reject(err); }
                else { resolve(subscription); }
            });
    });
};

let deleteStripeSubscription = async id => {
    return await new Promise(async (resolve, reject) => {
        await stripe.subscriptions.del(
            id, (err, confirmation) => {
                if (err) { console.log(err.message); reject(err); }
                else {
                    console.log(`Stripe subscription '${id}' deleted successfully.`);
                    resolve(confirmation);
                }
            }
        );
    });
};

let createMembershipSession = async (customerId,
                                     successUrl= "/stripe/success", cancelUrl= "/stripe/fail") => {
    return await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        subscription_data: {
            items: [{
                plan: process.env.STRIPE_MEMBERSHIP_PLAN_ID,
            }],
        },
        success_url: `${process.env.URL}${successUrl}?session_id={CHECKOUT_SESSION_ID}&customer_id=${customerId}`,
        cancel_url: process.env.URL + cancelUrl,
    });
};

let createEditCardSession = async (customerId, subscriptionId) => {
    return await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'setup',
        customer: customerId,
        setup_intent_data: {
            metadata: {
                customer_id: customerId,
                subscription_id: subscriptionId,
            },
        },
        //success_url: `${process.env.URL}/stripe/change-payment`,
        success_url: `${process.env.URL}/dashboard`,
        cancel_url: `${process.env.URL}/dashboard`,
    })
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

let getSession = async id => {
    return await new Promise(async (resolve, reject) => {
        await stripe.checkout.sessions.retrieve(
            id, (err, session) => {
                if (err) { console.log(err.message); reject(err); }
                else { resolve(session); }
            }
        )
    });
};

let getSetupIntent = async id => {
    return await new Promise(async (resolve,reject) => {
        await stripe.setupIntents.retrieve(
            id, (err, intent) => {
                if (err) { console.log(err.message); reject(err); }
                else { resolve(intent); }
            }
        );
    });
};

let getAllPaymentMethods = async id => {
    return await new Promise(async (resolve,reject) => {
        await stripe.paymentMethods.list({
            customer: id,
            type: "card"
        }, (err, paymentMethods) => {
            if (err) { console.log(err.message); reject(err); }
            else { resolve(paymentMethods); }
        });
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

let attachPaymentMethod = async (customerId, paymentMethodId) => {
    return await new Promise(async (resolve,reject) => {
        await stripe.paymentMethods.attach(
            paymentMethodId, { customer: customerId },
            (err, paymentMethod) => {
                if (err) { console.log(err.message); reject(err); }
                else { resolve(paymentMethod); }
            }
        )
    });
};

let detachPaymentMethod = async id => {
    return await new Promise(async (resolve,reject) => {
        await stripe.paymentMethods.detach(
            id, (err, paymentMethod) => {
                if (err) { console.log(err.message); reject(err); }
                else { resolve(paymentMethod); }
            }
        )
    });
};

let createWebhook = async (body, signature) => {
    return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_ID);
};

module.exports = {createStripeCustomer, updateStripeCustomer, updateStripeSubscription, deleteStripeSubscription,
    createMembershipSession, createEditCardSession,
    getAllCustomers, getCustomer, getSession, getSetupIntent, getAllPaymentMethods, getPaymentMethod,
    attachPaymentMethod, detachPaymentMethod, createWebhook};