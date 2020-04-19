require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


let createStripeCustomer = async (email, userId= undefined, name= undefined) => {
    try {
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
    } catch (e) {
        console.error(`createStripeCustomer(): ${e.message}`);
        return false;
    }
};

let updateStripeCustomer = async (id, data = {}) => {
    try {
        return await new Promise(async (resolve, reject) => {
            await stripe.customers.update(
                id, data, (err, customer) => {
                    if (err) { console.log(err.message); reject(err); }
                    else { resolve(customer); }
                });
        });
    } catch (e) {
        console.error(`updateStripeCustomer(): ${e.message}`);
        return false;
    }
};

let updateStripeSubscription = async (id, data = {}) => {
    try {
        return await new Promise(async (resolve, reject) => {
            await stripe.subscriptions.update(
                id, data, (err, subscription) => {
                    if (err) { console.log(err.message); reject(err); }
                    else { resolve(subscription); }
                });
        });
    } catch (e) {
        console.error(`updateStripeSubscription(): ${e.message}`);
        return false;
    }
};

let deleteStripeSubscription = async id => {
    try {
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
    } catch (e) {
        console.error(`deleteStripeSubscription(): ${e.message}`);
        return false;
    }
};

let createMembershipSession = async (customerId,
                                     successUrl= "/stripe/success", cancelUrl= "/stripe/fail") => {
    try {
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
    } catch (e) {
        console.error(`createMembershipSession(): ${e.message}`);
        return false;
    }
};

let createEditCardSession = async (customerId, subscriptionId) => {
    try {
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
    } catch (e) {
        console.error(`createEditCardSession(): ${e.message}`);
        return false;
    }
};

async function getAllCustomers() {
    try {
        return (await stripe.customers.list()).data;
    } catch (e) {
        console.error(`getAllCustomers(): ${e.message}`);
        return undefined;
    }
}

let getCustomer = async id => {
    try {
        return await new Promise(async (resolve, reject) => {
            await stripe.customers.retrieve(
                id, (err, customer) => {
                    if (err) { console.log(err); reject(err); }
                    else { resolve(customer); }
                }
            )
        });
    } catch (e) {
        console.error(`getCustomer(): ${e.message}`);
        return undefined;
    }
};

let getSession = async id => {
    try {
        return await new Promise(async (resolve, reject) => {
            await stripe.checkout.sessions.retrieve(
                id, (err, session) => {
                    if (err) { console.log(err.message); reject(err); }
                    else { resolve(session); }
                }
            )
        });
    } catch (e) {
        console.error(`getSession(): ${e.message}`);
        return undefined;
    }
};

let getSetupIntent = async id => {
    try {
        return await new Promise(async (resolve,reject) => {
            await stripe.setupIntents.retrieve(
                id, (err, intent) => {
                    if (err) { console.log(err.message); reject(err); }
                    else { resolve(intent); }
                }
            );
        });
    } catch (e) {
        console.error(`getSetupIntent(): ${e.message}`);
        return undefined;
    }
};

let getAllPaymentMethods = async id => {
    try {
        return await new Promise(async (resolve,reject) => {
            await stripe.paymentMethods.list({
                customer: id,
                type: "card"
            }, (err, paymentMethods) => {
                if (err) { console.log(err.message); reject(err); }
                else { resolve(paymentMethods); }
            });
        });
    } catch (e) {
        console.error(`getAllPaymentMethods(): ${e.message}`);
        return undefined;
    }
};

let getPaymentMethod = async id => {
    try {
        return await new Promise(async (resolve, reject) => {
            await stripe.paymentMethods.retrieve(
                id, (err, paymentMethod) => {
                    if (err) { console.log(err.message); reject(err); }
                    else { resolve(paymentMethod); }
                }
            );
        });
    } catch (e) {
        console.error(`getPaymentMethod(): ${e.message}`);
        return undefined;
    }
};

let attachPaymentMethod = async (customerId, paymentMethodId) => {
    try {
        return await new Promise(async (resolve,reject) => {
            await stripe.paymentMethods.attach(
                paymentMethodId, { customer: customerId },
                (err, paymentMethod) => {
                    if (err) { console.log(err.message); reject(err); }
                    else { resolve(paymentMethod); }
                }
            )
        });
    } catch (e) {
        console.error(`attachPaymentMethod(): ${e.message}`);
        return undefined;
    }
};

let detachPaymentMethod = async id => {
    try {
        return await new Promise(async (resolve,reject) => {
            await stripe.paymentMethods.detach(
                id, (err, paymentMethod) => {
                    if (err) { console.log(err.message); reject(err); }
                    else { resolve(paymentMethod); }
                }
            )
        });
    } catch (e) {
        console.error(`detachPaymentMethod(): ${e.message}`);
        return undefined;
    }
};

let getInvoice = async id => {
    try {
        return await new Promise(async (resolve, reject) => {
            await stripe.invoices.retrieve(
                id, (err, invoice) => {
                    if (err) { console.log(err.message); reject(err); }
                    else { resolve(invoice); }
                }
            );
        });
    } catch (e) {
        console.error(`getInvoice(): ${e.message}`);
        return undefined;
    }
};

let createWebhook = async (body, signature) => {
    return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_ID);
};

module.exports = {createStripeCustomer, updateStripeCustomer, updateStripeSubscription, deleteStripeSubscription,
    createMembershipSession, createEditCardSession,
    getAllCustomers, getCustomer, getSession, getSetupIntent, getAllPaymentMethods, getPaymentMethod,
    attachPaymentMethod, detachPaymentMethod, getInvoice, createWebhook};