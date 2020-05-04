const router = require("express").Router();
const bodyParser = require('body-parser');
const dbUtils = require("../utils/db-utils");
const stripeUtils = require("../utils/stripe-utils");
const botUtils = require("../utils/bot-utils");


//  Checks if cookie has user object to keep dashboard page, if not, go back to home page.
const authUserCheck = (req, res, next) => {
    req.user ? next() : res.redirect("/");
};

//  Pay membership route.
router.get("/pay", authUserCheck, async (req, res) => {
    try {
        //  Check if user doesn't have role.
        const ROLE = await dbUtils.getRole(req.user.user_id);
        if (ROLE) {
            return res.redirect("/dashboard");
        }

        //  Check if product is still in stock or if stock remaining exists and is above 0.
        if (!process.env.RELEASE_REMAINING_STOCK && !Boolean(process.env.IN_STOCK.toLowerCase() === "true")) {
            return res.redirect("/");
        } else if (process.env.RELEASE_REMAINING_STOCK && isNaN(parseInt(process.env.RELEASE_REMAINING_STOCK)) || parseInt(process.env.RELEASE_REMAINING_STOCK) <= 0) {
            process.env.IN_STOCK = "false";
            delete process.env.RELEASE_TOTAL_STOCK;
            delete process.env.RELEASE_REMAINING_STOCK;
            return res.redirect("/");
        }

        //  Check if user has subscription.
        if ((await stripeUtils.getCustomer(req.user.stripe_id))?.subscriptions.data?.[0]) {
            return res.redirect("/dashboard");
        }

        //  Create session and return javascript code to generate
        //  stripe checkout to buy membership automatically.
        const CURRENCY = req.url.includes("?currency=") ?
            req.url.substr(req.url.indexOf("?currency=") + "?currency=".length) : undefined;
        const SESSION = await stripeUtils.createMembershipSession(req.user.stripe_id, CURRENCY);
        return res.send(`
            <script src="https://js.stripe.com/v3/"></script>
            <script type="text/javascript">
                const stripe = Stripe("${process.env.STRIPE_KEY}");
                stripe.redirectToCheckout({
                    sessionId: "${SESSION.id}"
                }).then(r => {
                    if (r.error.message) { console.error(r.error); }
                }).catch(e => {
                    console.error("Error when redirecting to pay membership:", e.message);
                });
            </script>
        `);
    } catch (e) {
        console.error(`Route '/stripe/pay': ${e.message}`);
        res.redirect("/");
    }
});

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
        res.render("response", {status:"payment-success"});
    } else {
        console.error("User failed route '/stripe/success' auth.");
        res.redirect("/");
    }
});

router.get("/fail", (req, res) => {
    res.render("response", {status:"payment-fail"});
});

//  Cancel stripe subscription route
router.get("/cancel-membership", authUserCheck, async (req, res) => {
    try {
        //  Check if user has role and if role is not renewal (meaning lifetime or staff).
        const ROLE = await dbUtils.getRole(req.user.user_id);
        if (ROLE && ROLE.name !== "renewal") {
            if (await dbUtils.deleteData("user_roles", "user_id", req.user.user_id)) {
                await botUtils.kickUser(req.user.user_id, req.user.email);
                return res.render("response", {status:"cancel-role"});
            } else {
                return res.redirect("/dashboard");
            }
        }

        //  Get customer's object.
        const CUSTOMER = await stripeUtils.getCustomer(req.user.stripe_id);

        //  Check if customer has at least 1 subscription.
        if (!CUSTOMER.subscriptions.data.length > 0) {
            console.log(`User '${req.user.username}' tried to cancel a non-existing membership.`);
            return res.redirect("/");
        }

        //  Get customer's first subscription object.
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0];

        //  If subscription has already been cancelled, log it and return to dashboard.
        if (SUBSCRIPTION.cancel_at_period_end) {
            console.log(`User '${req.user.username}' tried to cancel an already cancelled membership.`);
            return res.redirect("/dashboard");
        }

        //  Update customer's first subscription object to cancel at the end of the period.
        //  Disable proration, so user is not billed a portion of the total price of the membership,
        //  as membership is still active until period ends.
        await stripeUtils.updateSubscription(
            SUBSCRIPTION.id,
            {proration_behavior: 'none', cancel_at_period_end: true}
        );

        //  Debugging
        console.log(`User '${req.user.username}' has cancelled its membership.`);
    } catch (e) {
        if (e.message.includes("Cannot read property 'id' of undefined")) {
            console.log(`User '${req.user.username}' tried to cancel non-existing membership.`);
        } else {
            console.error(`Route '/stripe/cancel-membership': ${e.message}`);
        }
    }
    res.redirect("/dashboard");
});

//  Renew stripe subscription route
router.get("/renew-membership", authUserCheck, async (req,res) => {
    try {
        //  Check if user has renewal role to renew subscription.
        const ROLE = await dbUtils.getRole(req.user.user_id);
        if (ROLE && ROLE.name !== "renewal") {
            return res.redirect("/dashboard");
        }

        //  Get customer's object.
        const CUSTOMER = await stripeUtils.getCustomer(req.user.stripe_id);

        //  Check if customer has at least 1 subscription.
        if (!CUSTOMER.subscriptions.data.length > 0) {
            console.log(`User '${req.user.username}' tried to renew a non-existing membership.`);
            return res.redirect("/");
        }

        //  Get customer's first subscription object.
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0];

        //  If subscription is not already cancelled, log it and return to dashboard.
        if (!SUBSCRIPTION.cancel_at_period_end) {
            console.log(`User '${req.user.username}' tried to renew an non-cancelled membership.`);
            return res.redirect("/dashboard");
        }

        //  Update customer's first subscription object to renew membership.
        await stripeUtils.updateSubscription(
            SUBSCRIPTION.id,
            {cancel_at_period_end: false}
        );

        //  Debugging
        console.log(`User '${req.user.username}' has renewed its membership.`);
    } catch (e) {
        console.error(`Route '/stripe/renew-membership': ${e.message}`);
    }
    res.redirect("/dashboard");
});

//  Transfer renewal or lifetime membership to another user.
router.get("/transfer-membership", authUserCheck, async (req, res) => {
    try {
        //  Check if user has role.
        const ROLE = await dbUtils.getRole(req.user.user_id);
        if (!ROLE) { return res.redirect("/"); }

        //  Check if user's role is not staff.
        if (["renewal", "lifetime"].indexOf(ROLE.name) === -1) {
            return res.render("response", {status:"transfer-staff"});
        }

        //  Check if url contains '?' and digits with quantity 1+.
        if (/\/transfer-membership\?\d+/g.test(req.url)) {
            //  Get user id from url and check if user exists in db.
            const USER_ID = req.url.substr("/transfer-membership?".length);
            const USER = await dbUtils.getData("users", "user_id", USER_ID);
            if (!USER) { return res.render("response", {status:"transfer-fail"}); }

            //  Check if user is 'renewal' or 'lifetime'.
            if (["renewal", "lifetime"].indexOf(ROLE.name) === -1) {
                return res.render("response", {status:"transfer-fail"});
            }

            let mode = undefined;
            if (ROLE.name === "lifetime") {
                mode = "lifetime";
            } else if (ROLE.name === "renewal") {
                //  Get subscription and check customer has one.
                const CUSTOMER = await stripeUtils.getCustomer(req.user.stripe_id);
                if (!CUSTOMER || CUSTOMER.subscriptions.data.length === 0) { return res.render("response", {status:"transfer-fail"}); }
                const SUBSCRIPTION = CUSTOMER.subscriptions.data[0];
                if (!SUBSCRIPTION) { return res.render("response", {status:"transfer-fail"}); }

                //  Create and delete subscriptions.
                await stripeUtils.transferSubscription(USER.stripe_id, SUBSCRIPTION.current_period_end);
                await stripeUtils.deleteSubscription(SUBSCRIPTION.id);

                mode = "renewal";
            }

            //  Check if mode was assigned.
            if (mode) {
                //  Try to update transferring user id to transferred user id.
                //  If not possible (due to transferring user's role deleted already),
                //  insert new user id with mode (which equals to role name).
                if (!(await dbUtils.updateData("user_roles", "user_id", req.user.user_id, "user_id", USER_ID))) {
                    const ROLE = await dbUtils.getData("roles", "name", mode);
                    if (!ROLE) { return res.render("response", {status:"transfer-fail"}); }
                    await dbUtils.insertData("user_roles", [USER_ID, ROLE["role_id"]])
                }

                //  Debugging and return success response.
                console.log(`User '${req.user.username}' transferred its ${mode} license to '${USER.username}'.`);
                return res.render("response", {status:"transfer-success"});
            } else {
                //  Mode was not assigned.
                return res.render("response", {status:"transfer-fail"});
            }
        } else {
            //  Url doesn't match.
            return res.render("response", {status:"transfer-fail"});
        }
    } catch (e) {
        console.error(`Route '/stripe/transfer-membership': ${e.message}`);
        res.render("response", {status:"transfer-fail"});
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
            return res.status(400).send(`createWebhook() in '/stripe/webhook' route: ${err.message}`);
        }

        //  Get necessary objects for ifs.
        const SESSION = event.data.object;
        const USER = await dbUtils.getData("users", "stripe_id", SESSION.customer);

        //  Ifs for different webhook events.
        if (event.type === 'checkout.session.completed') {
            //  Event is triggered when paying for a product or subscription,
            //  or when changing a customer's payment details.

            //  Get necessary objects.
            const CUSTOMER = await stripeUtils.getCustomer(USER.stripe_id);
            const SUBSCRIPTION = CUSTOMER?.subscriptions.data[0];

            //  Init default payment var to set it to a payment method id,
            //  depending if session was in setup mode or not.
            let defaultPayment;
            if (SESSION.mode === "setup") {
                //  Check if subscription was meant to get cancelled by the end of period,
                //  if true, set 'cancel_at_period_end' to false.
                if (SUBSCRIPTION?.cancel_at_period_end) {
                    await stripeUtils.updateSubscription(SUBSCRIPTION.id, {cancel_at_period_end: false});
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
                //  Check if release is active. If so, if is number and number is greater than 0, subtract 1.
                //  Else, delete environmental variable.
                if (process.env.RELEASE_REMAINING_STOCK) {
                    const REMAINING_STOCK = parseInt(process.env.RELEASE_REMAINING_STOCK);
                    if (!isNaN(REMAINING_STOCK) && REMAINING_STOCK > 0) {
                        process.env.RELEASE_REMAINING_STOCK = (REMAINING_STOCK - 1).toString();

                        //  Check if release still has stock.
                        if (REMAINING_STOCK - 1 <= 0) {
                            console.log("Release has ran out of stock.");
                            process.env.IN_STOCK = "false";
                            delete process.env.RELEASE_TOTAL_STOCK;
                            delete process.env.RELEASE_REMAINING_STOCK;
                        }
                    } else {
                        process.env.IN_STOCK = "false";
                        delete process.env.RELEASE_TOTAL_STOCK;
                        delete process.env.RELEASE_REMAINING_STOCK;
                    }
                }

                //  Set defaultPayment var to payment method's id from customer's subscription.
                defaultPayment = SUBSCRIPTION.default_payment_method;

                //  Set user's role to 'renewal' if user doesn't have a role.
                const USER_ROLE = await dbUtils.getData("user_roles", "user_id", USER.user_id);
                if (!USER_ROLE) {
                    const RENEWAL_ROLE = await dbUtils.getData("roles", "name", "renewal");
                    await dbUtils.insertData("user_roles", [USER.user_id, RENEWAL_ROLE ? RENEWAL_ROLE["role_id"] : 7]);
                }

                //  Debugging
                console.log(`User '${USER.username}' has bought a subscription.`);
            }

            //  Update customer's and customer subscription's
            //  default payment with defaultPayment var
            await stripeUtils.updateCustomer(CUSTOMER.id,
                {
                    invoice_settings:
                        {
                            default_payment_method: defaultPayment
                        },
                });
            await stripeUtils.updateSubscription(SUBSCRIPTION.id,
                {
                    default_payment_method: defaultPayment
                });
        } else if (event.type === "customer.subscription.deleted") {
            //  Event is triggered when a subscription is cancelled immediately,
            //  or when a cancelled subscription has reached its period end.

            //  Debugging.
            console.log(`User '${USER.username}'s membership has been deleted.`);

            //  Check if user is non-staff member to remove role and kick from server.
            const ROLE = await dbUtils.getRole(USER.user_id);
            if (ROLE?.name === "renewal") {
                //  Remove from 'user_roles' table and kick from server.
                await dbUtils.deleteData("user_roles", "user_id", USER.user_id);
                await botUtils.kickUser(USER.user_id, USER.email)
            }

            //  Detach all customer's cards.
            (await stripeUtils.getAllPaymentMethods(USER.stripe_id)).data.map(pm => pm.id).forEach(pm => {
                stripeUtils.detachPaymentMethod(pm).then();
            });
        }
        await res.json({received: true});
    } catch (e) {
        res.status(400).send(`Route '/stripe/webhook': ${e.message}`);
    }
});

module.exports = router;