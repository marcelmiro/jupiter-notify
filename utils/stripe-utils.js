require("dotenv").config();
const dbUtils = require("./db-utils");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


let createCustomer = async (email, userId, name, currency= "eur") => {
    try {
        //  Validate parameter 'email'.
        if (!email) {
            console.error("createCustomer(): Parameter 'email' is undefined.");
            return false;
        }

        //  Create customer's data object.
        let data = {
            email: email,
            description: userId || "",
            name: name || ""
        };

        return await new Promise(async (resolve, reject) => {
            await stripe.customers.create(
                data,(err, customer) => {
                    if (err) { console.error(err); reject(err); }
                    else {
                        // console.log(`Customer '${email}' inserted into database.`);
                        resolve(customer.id);
                    }
                }
            )
        });
    } catch (e) {
        console.error(`createCustomer(): ${e.message}`);
        return false;
    }
};

let updateCustomer = async (id, data = {}) => {
    try {
        //  Validate parameter 'id'.
        if (!id) {
            console.error("updateCustomer(): Parameter 'id' is undefined.");
            return false;
        }

        return await new Promise(async (resolve, reject) => {
            await stripe.customers.update(
                id, data, (err, customer) => {
                    if (err) { console.error(err); reject(err); }
                    else { resolve(customer); }
                });
        });
    } catch (e) {
        console.error(`updateCustomer(): ${e.message}`);
        return false;
    }
};

let deleteCustomer = async id => {
    try {
        //  Validate parameter 'id'.
        if (!id) {
            console.error("updateCustomer(): Parameter 'id' is undefined.");
            return false;
        }

        return await new Promise(async (resolve, reject) => {
            await stripe.customers.del(
                id,(err, confirmation) => {
                    if (err) { console.error(err); reject(err); }
                    else { resolve(confirmation); }
                });
        });
    } catch (e) {
        console.error(`deleteCustomer(): ${e.message}`);
        return false;
    }
}

let updateSubscription = async (id, data = {}) => {
    try {
        //  Validate parameter 'id'.
        if (!id) {
            console.error("updateSubscription(): Parameter 'id' is undefined.");
            return false;
        }

        return await new Promise(async (resolve, reject) => {
            await stripe.subscriptions.update(
                id, data, (err, subscription) => {
                    if (err) { console.error(err); reject(err); }
                    else { resolve(subscription); }
                });
        });
    } catch (e) {
        console.error(`updateSubscription(): ${e.message}`);
        return false;
    }
};

let deleteSubscription = async id => {
    try {
        //  Validate parameter 'id'.
        if (!id) {
            console.error("deleteSubscription(): Parameter 'id' is undefined.");
            return false;
        }

        return await new Promise(async (resolve, reject) => {
            await stripe.subscriptions.del(
                id, (err, confirmation) => {
                    if (err) { console.error(err); reject(err); }
                    else { resolve(confirmation); }
                }
            );
        });
    } catch (e) {
        console.error(`deleteSubscription(): ${e.message}`);
        return false;
    }
};

let createMembershipSession = async (customerId, currency = "EUR") => {
    try {
        //  Validate parameter 'customerId'.
        if (!customerId) {
            console.error("createMembershipSession(): Parameter 'customerId' is undefined.");
            return false;
        }

        //  Get customer object and check if customer exists.
        const CUSTOMER = await getCustomer(customerId);
        if (!CUSTOMER) {
            console.error("createMembershipSession(): Stripe customer doesn't exist.");
            return false;
        }

        //  Check customer's currency is the same as the currency customer wants to pay in.
        //  If not, delete customer and create new customer with same data, but different currency.
        //  OPTIMIZE ifs.
        if (CUSTOMER.currency && CUSTOMER.currency.toLowerCase() !== currency.toLowerCase()) {
            if (process.env["STRIPE_PLAN_ID_" + currency.toUpperCase()]) {
                await deleteCustomer(customerId);
                customerId = await createCustomer(CUSTOMER.email, CUSTOMER.description, CUSTOMER.name);
                await dbUtils.updateData("users", "user_id", CUSTOMER.description, "stripe_id", customerId);
            } else if (CUSTOMER.currency.toLowerCase() !== "eur") {
                await deleteCustomer(customerId);
                customerId = await createCustomer(CUSTOMER.email, CUSTOMER.description, CUSTOMER.name);
                await dbUtils.updateData("users", "user_id", CUSTOMER.description, "stripe_id", customerId);
                currency = "eur";
            }
        }

        //  Get stripe plan id depending on currency.
        const PLAN_ID = process.env["STRIPE_PLAN_ID_" + currency.toUpperCase()] ?
            process.env["STRIPE_PLAN_ID_" + currency.toUpperCase()] : process.env.STRIPE_PLAN_ID;

        return await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            subscription_data: {
                items: [{
                    plan: PLAN_ID,
                }],
            },
            success_url: `${process.env.URL}/stripe/success?session_id={CHECKOUT_SESSION_ID}&customer_id=${customerId}`,
            cancel_url: process.env.URL + "/stripe/fail",
        });
    } catch (e) {
        console.error(`createMembershipSession(): ${e.message}`);
        return false;
    }
};

let createEditCardSession = async (customerId, subscriptionId) => {
    try {
        //  Validate parameters.
        const PARAMS = [customerId, subscriptionId];
        if (PARAMS.filter(n => {return n}).length < PARAMS.length) {
            console.error("createEditCardSession(): At least 1 parameter is undefined.");
            return false;
        }

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

let transferSubscription = async (customerId, date) => {
    try {
        //  Validate parameter 'customerId'.
        if (!customerId) {
            console.error("transferSubscription(): Parameter 'customerId' is undefined.");
            return undefined;
        }

        return await new Promise(async (resolve, reject) => {
            await stripe.subscriptions.create({
                customer: customerId,
                items: [{ plan: process.env.STRIPE_MEMBERSHIP_PLAN_ID }],
                billing_cycle_anchor: date,
                proration_behavior: "none",
            }, (err, subscription) => {
                if (err) { console.error(err); reject(err); }
                else { resolve(subscription); }
            });
        });
    } catch (e) {
        console.error(`transferSubscription(): ${e.message}`);
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
        //  Validate parameter 'id'.
        if (!id) {
            console.error("getCustomer(): Parameter 'id' is undefined.");
            return undefined;
        }

        return await new Promise(async (resolve, reject) => {
            await stripe.customers.retrieve(
                id, (err, customer) => {
                    if (err) { console.error(err); reject(err); }
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
        //  Validate parameter 'id'.
        if (!id) {
            console.error("getSession(): Parameter 'id' is undefined.");
            return undefined;
        }

        return await new Promise(async (resolve, reject) => {
            await stripe.checkout.sessions.retrieve(
                id, (err, session) => {
                    if (err) { console.error(err); reject(err); }
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
        //  Validate parameter 'id'.
        if (!id) {
            console.error("getSetupIntent(): Parameter 'id' is undefined.");
            return undefined;
        }

        return await new Promise(async (resolve,reject) => {
            await stripe.setupIntents.retrieve(
                id, (err, intent) => {
                    if (err) { console.error(err); reject(err); }
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
        //  Validate parameter 'id'.
        if (!id) {
            console.error("getAllPaymentMethods(): Parameter 'id' is undefined.");
            return undefined;
        }

        return await new Promise(async (resolve,reject) => {
            await stripe.paymentMethods.list({
                customer: id,
                type: "card"
            }, (err, paymentMethods) => {
                if (err) { console.error(err); reject(err); }
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
        //  Validate parameter 'id'.
        if (!id) {
            console.error("getPaymentMethod(): Parameter 'id' is undefined.");
            return undefined;
        }

        return await new Promise(async (resolve, reject) => {
            await stripe.paymentMethods.retrieve(
                id, (err, paymentMethod) => {
                    if (err) { console.error(err); reject(err); }
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
        //  Validate parameters.
        const PARAMS = [customerId, paymentMethodId];
        if (PARAMS.filter(n => {return n}).length < PARAMS.length) {
            console.error("attachPaymentMethod(): At least 1 parameter is undefined.");
            return undefined;
        }

        return await new Promise(async (resolve,reject) => {
            await stripe.paymentMethods.attach(
                paymentMethodId, { customer: customerId },
                (err, paymentMethod) => {
                    if (err) { console.error(err); reject(err); }
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
        //  Validate parameter 'id'.
        if (!id) {
            console.error("detachPaymentMethod(): Parameter 'id' is undefined.");
            return undefined;
        }

        return await new Promise(async (resolve,reject) => {
            await stripe.paymentMethods.detach(
                id, (err, paymentMethod) => {
                    if (err) { console.error(err); reject(err); }
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
        //  Validate parameter 'id'.
        if (!id) {
            console.error("getInvoice(): Parameter 'id' is undefined.");
            return undefined;
        }

        return await new Promise(async (resolve, reject) => {
            await stripe.invoices.retrieve(
                id, (err, invoice) => {
                    if (err) { console.error(err); reject(err); }
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
    //  Validate parameters.
    const PARAMS = [body, signature];
    if (PARAMS.filter(n => {return n}).length < PARAMS.length) {
        console.error("createWebhook(): At least 1 parameter is undefined.");
        return undefined;
    }

    return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_ID);
};

module.exports = {createCustomer, updateCustomer, deleteCustomer, updateSubscription, deleteSubscription,
    createMembershipSession, createEditCardSession, transferSubscription,
    getAllCustomers, getCustomer, getSession, getSetupIntent, getAllPaymentMethods, getPaymentMethod,
    attachPaymentMethod, detachPaymentMethod, getInvoice, createWebhook};