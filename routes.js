require("dotenv").config();
const router = require("express").Router();
const passport = require("passport");
const bodyParser = require('body-parser');
const utils = require("./utils/utils");
const dbUtils = require("./utils/db-utils");
const stripeUtils = require("./utils/stripe-utils");
const botUtils = require("./utils/bot-utils");
const nodemailerSetup = require("./nodemailer-setup");


//  Checks if cookie has user object to redirect to dashboard, instead of having to login again.
const authLoginCheck = (req, res, next) => {
    req.user ? res.redirect("/dashboard") : next();
};
//  Checks if cookie has user object to keep dashboard page, if not, go back to home page.
const authDashboardCheck = (req, res, next) => {
    req.user ? next() : res.redirect("/");
};

router.get("/", async (req, res) => {
    //  IN STOCK?IS USER?HAS MEMBERSHIP?dashboard button:pay now button:login button:oos button
    //  Check if product is in stock and if browser has user data in cookies.
    const IN_STOCK = Boolean(process.env.IN_STOCK.toLowerCase() === "true");
    const IS_USER = Boolean(req.user);

    //  Check if customer has subscription and if product is in stock to create session.
    const HAS_MEMBERSHIP =
        Boolean(IS_USER && (await stripeUtils.getCustomer(req.user["stripe_id"])).subscriptions.data.length > 0);
    const SESSION = IS_USER && !HAS_MEMBERSHIP ?
        await stripeUtils.createMembershipSession(req.user["stripe_id"]) : undefined;

    //  Render index page with necessary data.
    res.render("index",
        {
            inStock: IN_STOCK,
            isUser: IS_USER,
            hasMembership: HAS_MEMBERSHIP,
            stripeKey: process.env.STRIPE_KEY,
            session: SESSION,
        });
});

//  Discord login route
router.get("/auth/login", authLoginCheck, (req,res) => {
    //  If url contains filter 'pay', set query return value to 'subscription-checkout'.
    req.query.returnTo = req.url.includes("?pay") ? "subscription-checkout" : undefined;

    //  If 'returnTo' contains string, encode to base64 to send it as an option to auth.
    const { returnTo } = req.query;
    const STATE = returnTo ? Buffer.from(JSON.stringify({ returnTo })).toString('base64') : undefined;

    //  Authenticate.
    passport.authenticate(
        "discord",
        { scope: ["identify", "email"], state: STATE }
    )(req,res);
});

//  Discord redirect route
router.get("/auth/redirect", passport.authenticate("discord", {
    failureRedirect: "/"
}), async (req, res) => {
    //  Checks if user has membership. If true, redirect to dashboard,
    //  else redirect to stripe checkout to pay subscription.
    const CUSTOMER = await stripeUtils.getCustomer(req.user["stripe_id"]);
    if (CUSTOMER.subscriptions.data.length > 0) {
        return res.redirect("/dashboard");
    } else {
        //  Try to get 'returnTo' value from 'req.query.state'. If doesn't exist, fall back to catch code.
        try {
            //  Get and decode 'returnTo' var.
            const { state } = req.query;
            const { returnTo } = JSON.parse(Buffer.from(state, 'base64').toString());

            //  Validate 'returnTo' var.
            if (typeof returnTo === 'string' && (returnTo.startsWith('/') || returnTo.match(/^[A-Z0-9]/i))) {
                //  Ifs to check if 'returnTo' is a url, or equals to a specific keyword.
                if (returnTo.startsWith('/')) {
                    return res.redirect(returnTo);
                } else if (returnTo === "subscription-checkout") {
                    //  Create session and return javascript code to generate
                    //  stripe checkout to buy membership automatically.
                    const SESSION = await stripeUtils.createMembershipSession(req.user["stripe_id"]);
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
                } else {
                    return res.redirect("/dashboard");
                }
            } else {
                return res.redirect("/dashboard");
            }
        } catch (e) {
            return res.redirect("/");
        }
    }
});

router.get("/auth/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

//  Testing dashboard design route
/*router.get("/test", (req,res) => {
    res.render("test");
});*/

router.get("/dashboard", authDashboardCheck, async (req, res) => {
    // TODO Check if user is a stripe customer (Special case)
    // FIXME user.stripe_id contains deleted customer and not new customer id,
    //  therefore error "Cannot read property 'data' of undefined.
    //  I think it's because stripe_id was updated in either localhost or heroku db but no in the other.

    //  Get user info
    let user = await dbUtils.getData("user_id", req.user["user_id"]);
    let data = JSON.parse(decodeURI(user.data));

    //  Get user's stripe info to check if user has membership active.
    const CUSTOMER = await stripeUtils.getCustomer(req.user["stripe_id"]);
    data.has_membership = CUSTOMER.subscriptions.data.length > 0;

    //  If user doesn't have membership, return to home page, else continue with code.
    if (!data.has_membership) {
        return res.redirect("/");
    }

    //  Updates user's data in db with new data.
    await utils.getFromDataAndUpdate(req.user["user_id"], data);
    user.data = data;

    //  Sets membership and payment details object.
    let membershipDetails = {
        isCancelled: false,
        interval: undefined,
        price: undefined,
        dateNextPayment: undefined,
        dateCreated: undefined,
    };
    let paymentDetails = {
        name: "null",
        last4: "null",
        dateExpiry: "null",
    };

    //  Get customer's subscription.
    const SUBSCRIPTION = CUSTOMER.subscriptions.data[0];
    //  Create session to update subscription payment details.
    const SESSION = await stripeUtils.createEditCardSession(req.user["stripe_id"], SUBSCRIPTION.id);

    //  Get customer's membership details.
    membershipDetails.isCancelled = Boolean(SUBSCRIPTION.cancel_at_period_end);
    if (SUBSCRIPTION.plan.interval === "month") {
        membershipDetails.interval = "Monthly";
    } else if (SUBSCRIPTION.plan.interval === "day") {
        membershipDetails.interval = "Daily";
    } else {
        membershipDetails.interval = SUBSCRIPTION.plan.interval;
    }
    membershipDetails.price = "$" + (Math.round(SUBSCRIPTION.plan.amount) / 100).toFixed(2);
    membershipDetails.dateNextPayment = await utils.transformDate(new Date(SUBSCRIPTION.current_period_end * 1000));
    membershipDetails.dateCreated = await utils.transformDate(new Date(SUBSCRIPTION.created * 1000));

    //  If subscription has default payment, get customer's payment details.
    if (SUBSCRIPTION.default_payment_method) {
        const DEFAULT_PAYMENT = await stripeUtils.getPaymentMethod(SUBSCRIPTION.default_payment_method);

        paymentDetails.name = DEFAULT_PAYMENT.billing_details.name;
        paymentDetails.last4 = DEFAULT_PAYMENT.card.last4;
        const MONTH = DEFAULT_PAYMENT.card.exp_month.toString();
        const YEAR = DEFAULT_PAYMENT.card.exp_year.toString();
        paymentDetails.dateExpiry =
            (MONTH.length === 1 ? "0" + MONTH : MONTH) + "/" + (YEAR.length === 4 ? YEAR.slice(-2) : YEAR);
    }

    //  Login user again to update data.
    req.login(user, err => {
        if (err) { console.log(err.message); }
    });

    //  Render dashboard ejs with all necessary data.
    res.render("dashboard",
        {
            user: user,
            data: data,
            stripeKey: process.env.STRIPE_KEY,
            membershipDetails: membershipDetails,
            paymentDetails: paymentDetails,
            session: SESSION,
            userInServer: Boolean(await botUtils.getUser(req.user["user_id"]))
        });
});

router.get("/stripe/success", (req, res) => {
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

router.get("/stripe/fail", (req, res) => {
    res.render("payment-response", {status:"fail"});
});

//  Cancel stripe subscription route
router.get("/stripe/cancel-membership", async (req, res) => {
    try {
        //  Get customer's first subscription object.
        const SUBSCRIPTION = (await stripeUtils.getCustomer(req.user["stripe_id"])).subscriptions.data[0];

        //  If subscription has already been cancelled, log it and return to dashboard.
        if (SUBSCRIPTION.cancel_at_period_end) {
            console.log(`User '${req.user["username"]}' tried to cancel an already cancelled membership.`);
            return res.redirect("/dashboard");
        }

        //  Update customer's first subscription object to cancel at the end of the period.
        await stripeUtils.updateStripeSubscription(
            SUBSCRIPTION.id,
            {cancel_at_period_end: true}
            );

        //  Kick user from discord server. May log error "User was not found in Discord server.",
        //  due to not finding user in Discord server.
        await botUtils.kickUser(req.user["user_id"], req.user["email"]);

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
router.get("/stripe/renew-membership", async (req,res) => {
    try {
        //  Get customer's first subscription object.
        const SUBSCRIPTION = (await stripeUtils.getCustomer(req.user["stripe_id"])).subscriptions.data[0];

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

//  Change customer's payment details route.
/*router.get("/stripe/change-payment", async (req,res) => {
    res.send(req.url);
});*/

//  Route to invite discord user to server
router.get("/discord/join", async (req,res) => {
    //  Get user's stripe info to check if user has membership active
    const STRIPE_CUSTOMER = await stripeUtils.getCustomer(req.user["stripe_id"]);
    if (STRIPE_CUSTOMER.subscriptions.data.length > 0) {
        //  Invites user to server. If response is true redirects to discord invite url, else closes tab.
        botUtils.inviteUser(req.user["user_id"]).then(r => {
            r ? res.redirect(r) : res.send(`<script>window.close();</script>`);
        });
    } else {
        console.log(`User '${req.user["username"]}' trying to join Discord server without subscription.`);
        res.redirect("/")
    }
});

//  Route to send emails
router.post("/send-email", bodyParser.raw({type: 'application/json'}), async (req,res) => {
    try {
        const response = await nodemailerSetup.sendEmail(
            req.body.email,
            "SUPPORT: " + req.body.name,
            `Name: ${req.body.name}\nEmail: ${req.body.email}\n\nText:\n${req.body.text}`,
        );
        console.log(`Email sent to '${response.accepted.join("', '")}'.`);
        if (response.rejected.length > 0) {
            console.log(`Email was rejected by '${response.rejected.join("', '")}'.`);
        }
    } catch (e) {
        return res.status(400).send("Send email error:", e.message);
    }
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

        //  Ifs for different webhook events.
        if (event.type === 'checkout.session.completed') {
            //  Event is triggered when paying for a product or subscription,
            //  or when changing a customer's payment details.

            //  Get necessary objects.
            const SESSION = event.data.object;
            const USER = await dbUtils.getData("stripe_id", SESSION.customer);
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
                // If user didn't have a subscription, log new subscription message,
                // and update user data's 'has_membership' value to true.
                if (!JSON.parse(decodeURI(USER.data)).has_membership) {
                    console.log(`User '${USER.username}' has bought a subscription.`);
                    await utils.getFromDataAndUpdate(USER["user_id"], {"has_membership":true});
                }

                //  Set defaultPayment var to payment method's id from last customer's subscription.
                defaultPayment = SUBSCRIPTION.default_payment_method;
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
        }
        await res.json({received: true});
    } catch (e) {
        console.log("Error in /webhook route:", e.message);
        return false;
    }
});

router.get("/design", (req,res) => {
    res.render("design");
});

module.exports = router;