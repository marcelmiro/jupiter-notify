const router = require("express").Router();
const bodyParser = require('body-parser');
const dbUtils = require("../utils/db-utils");
const stripeUtils = require("../utils/stripe-utils");
const botUtils = require("../utils/bot-utils");


router.get("/success", (req, res) => {
    //  Check if url contains "?" to know if url contains url filters
    let filters = req.url.substring(req.url.indexOf("/success?") + "/success?".length).split("&");
    let filter_dict = {};

    //  Get filters and pass them to dictionary 'filter_dict'
    for (let filter of filters) {
        filter_dict[filter.substring(0, filter.indexOf("="))] = filter.substring(filter.indexOf("=") + 1);
    }

    //  Checks if filters are true to render success page
    if (filter_dict["session_id"] && filter_dict["customer_id"]) {
        res.render("payment-response", {status:"success"});
    } else {
        //  Log error
        let date = new Date();
        let time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log(time + ": /success route problem.");
        res.redirect("/");
    }
});

router.get("/fail", (req, res) => {
    res.render("payment-response", {status:"fail"});
});

//  Cancel stripe subscription route
router.get("/cancel-membership", async (req, res) => {
    try {
        //  Get customer's object.
        const CUSTOMER = await stripeUtils.getCustomer(req.user["stripe_id"]);

        //  Check if customer has at least 1 subscription.
        if (!CUSTOMER.subscriptions.data.length > 0) {
            console.log(`User '${req.user["username"]}' tried to cancel a non-existing membership.`);
            return res.redirect("/");
        }

        //  Get customer's first subscription object.
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0];

        //  If subscription has already been cancelled, log it and return to dashboard.
        if (SUBSCRIPTION.cancel_at_period_end) {
            console.log(`User '${req.user["username"]}' tried to cancel an already cancelled membership.`);
            return res.redirect("/dashboard");
        }

        //  Update customer's first subscription object to cancel at the end of the period.
        //  Disable proration, so user is not billed a portion of the total price of the membership,
        //  as membership is still active until period ends.
        await stripeUtils.updateStripeSubscription(
            SUBSCRIPTION.id,
            {proration_behavior: 'none', cancel_at_period_end: true}
        );

        //  Debugging
        console.log(`User '${req.user["username"]}' has cancelled its membership.`);
    } catch (e) {
        if (e.message.includes("Cannot read property 'id' of undefined")) {
            console.log(`User '${req.user["username"]}' tried to cancel non-existing membership.`);
        } else {
            console.log("Error in '/stripe/cancel-membership' route:", e.message);
        }
    }
    res.redirect("/dashboard");
});

//  Renew stripe subscription route
router.get("/renew-membership", async (req,res) => {
    try {
        //  Get customer's object.
        const CUSTOMER = await stripeUtils.getCustomer(req.user["stripe_id"]);

        //  Check if customer has at least 1 subscription.
        if (!CUSTOMER.subscriptions.data.length > 0) {
            console.log(`User '${req.user["username"]}' tried to renew a non-existing membership.`);
            return res.redirect("/");
        }

        //  Get customer's first subscription object.
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0];

        //  If subscription is not already cancelled, log it and return to dashboard.
        if (!SUBSCRIPTION.cancel_at_period_end) {
            console.log(`User '${req.user["username"]}' tried to renew an non-cancelled membership.`);
            return res.redirect("/dashboard");
        }

        //  Update customer's first subscription object to renew membership.
        await stripeUtils.updateStripeSubscription(
            SUBSCRIPTION.id,
            {cancel_at_period_end: false}
        );

        //  Debugging
        console.log(`User '${req.user["username"]}' has renewed its membership.`);
    } catch (e) {
        console.log("Error in '/stripe/renew-membership' route:", e.message);
    }
    res.redirect("/dashboard");
});

//  Webhook route for stripe events
router.post("/webhook", bodyParser.raw({type: 'application/json'}), async (req, res) => {
    // TODO Code when payment failed from customer. Event type = "invoice.payment_failed".
    try {
        const STRIPE_SIG = req.headers['stripe-signature'];

        //  Create webhook event object
        let event;
        try {
            event = await stripeUtils.createWebhook(req.body, STRIPE_SIG);
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        //  Get necessary objects for ifs.
        const SESSION = event.data.object;
        const USER = await dbUtils.getData("users", "stripe_id", SESSION.customer);

        //  Ifs for different webhook events.
        if (event.type === 'checkout.session.completed') {
            //  Event is triggered when paying for a product or subscription,
            //  or when changing a customer's payment details.

            //  Get necessary objects.
            const CUSTOMER = await stripeUtils.getCustomer(USER["stripe_id"]);
            const SUBSCRIPTION = CUSTOMER.subscriptions.data[0];

            //  Init default payment var to set it to a payment method id,
            //  depending if session was in setup mode or not.
            let defaultPayment;
            if (SESSION.mode === "setup") {
                //  Check if subscription was meant to get cancelled by the end of period,
                //  if true, set 'cancel_at_period_end' to false.
                if (SUBSCRIPTION.cancel_at_period_end) {
                    await stripeUtils.updateStripeSubscription(SUBSCRIPTION.id, {cancel_at_period_end: false});
                }

                //  Get setup intent object to get payment method. Detach all payment methods from customer.
                const SETUP_INTENT = await stripeUtils.getSetupIntent(SESSION.setup_intent);
                (await stripeUtils.getAllPaymentMethods(CUSTOMER.id)).data.map(pm => pm.id).forEach(pm => {
                    pm !== SETUP_INTENT.payment_method ? stripeUtils.detachPaymentMethod(pm).then() : "";
                });

                //  Attach payment method to customer, and set defaultPayment var to payment method's id.
                defaultPayment = (await stripeUtils.attachPaymentMethod(
                    CUSTOMER.id,
                    SETUP_INTENT.payment_method
                )).id;

                //  Debugging
                console.log(`User '${USER.username}' changed its payment method.`);
            } else {    //  SESSION.mode === "subscription"
                //  Set defaultPayment var to payment method's id from customer's subscription.
                defaultPayment = SUBSCRIPTION.default_payment_method;

                //  Set user's role to 'renewal'.
                const USER_ROLE = await dbUtils.getData("user_roles", "user_id", USER["user_id"]);
                const RENEWAL_ROLE = await dbUtils.getData("roles", "name", "renewal");
                if (!USER_ROLE) {
                    await dbUtils.insertData("user_roles", [USER["user_id"], RENEWAL_ROLE["role_id"]]);
                    console.log(`User '${USER.username}' is now a renewal member.`);
                }

                //  Debugging
                console.log(`User '${USER.username}' has bought a subscription.`);
            }

            //  Update customer's and customer subscription's
            //  default payment with defaultPayment var
            await stripeUtils.updateStripeCustomer(CUSTOMER.id,
                {
                    invoice_settings:
                        {
                            default_payment_method: defaultPayment
                        },
                });
            await stripeUtils.updateStripeSubscription(SUBSCRIPTION.id,
                {
                    default_payment_method: defaultPayment
                });
        } else if (event.type === "customer.subscription.deleted") {
            //  Event is triggered when a subscription is cancelled immediately,
            //  or when a cancelled subscription has reached its period end.

            //  Remove user's role and debugging.
            console.log(`User '${USER.username}' has cancelled its membership.`);
            await dbUtils.deleteData("user_roles", "user_id", USER["user_id"]);
            console.log(`User '${USER.username}' doesn't have a role anymore.`);

            //  Kick user from discord server. May log error "User was not found in Discord server.",
            //  due to not finding user in Discord server. If user not found, sends email notifying the kick.
            await botUtils.kickUser(USER["user_id"], USER["email"]);
        }
        await res.json({received: true});
    } catch (e) {
        console.log("Error in '/webhook' route:", e.message);
        return false;
    }
});

module.exports = router;