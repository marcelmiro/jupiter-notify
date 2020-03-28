require("dotenv").config();
const router = require("express").Router();
const passport = require("passport");
const bodyParser = require('body-parser');
const utils = require("./utils/utils");
const dbUtils = require("./utils/db-utils");
const stripeUtils = require("./utils/stripe-utils");
const botUtils = require("./utils/bot-utils");


//  Checks if cookie has user object to redirect to dashboard, instead of having to login again.
const authLoginCheck = (req, res, next) => {
    req.user ? res.redirect("/dashboard") : next();
};
//  Checks if cookie has user object to keep dashboard page, if not, go back to home page.
const authDashboardCheck = (req, res, next) => {
    req.user ? next() : res.redirect("/");
};

router.get("/", (req, res) => {
    res.render("index");
});

//  Discord login route
router.get("/auth", authLoginCheck, passport.authenticate(
    "discord",
    { scope: ["identify", "email"] }
));

//  Discord redirect route
router.get("/auth/redirect",passport.authenticate(
    "discord", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/dashboard");
    });

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

router.get("/dashboard", authDashboardCheck, async (req, res) => {
    //  Get user info
    let user = await dbUtils.getData("user_id", req.user["user_id"]);
    let data = JSON.parse(decodeURI(user.data));
    // TODO Check if user is a stripe customer (Special case)

    // FIXME user.stripe_id contains deleted customer and not new customer id,
    //  therefore error "Cannot read property 'data' of undefined.
    //  I think it's because stripe_id was updated in either localhost or heroku db but no in the other.

    //  Get user's stripe info to check if user has membership active
    let stripeCustomer = await stripeUtils.getCustomer(req.user["stripe_id"]);
    data.has_membership = stripeCustomer.subscriptions.data.length > 0;

    //  Updates user's info in db with new data
    await utils.getFromDataAndUpdate(req.user["user_id"], data);
    user.data = data;

    //  Sets payment details object
    let paymentDetails = {
        interval: undefined,
        price: undefined,
        nextPayment: undefined,
        cardLast4: undefined,
    };

    //  If user has membership, change payment details object values
    //  with correct ones, gotten from user's subscription
    if (data.has_membership) {
        const SUBSCRIPTION = stripeCustomer.subscriptions.data[stripeCustomer.subscriptions.data.length - 1];

        if (SUBSCRIPTION.plan.interval === "month") {
            paymentDetails.interval = "Monthly";
        } else if (SUBSCRIPTION.plan.interval === "day") {
            paymentDetails.interval = "Daily";
        } else {
            paymentDetails.interval = SUBSCRIPTION.plan.interval;
        }
        paymentDetails.price = "$" + (Math.round(SUBSCRIPTION.plan.amount) / 100).toFixed(2);
        let date = new Date(SUBSCRIPTION.current_period_end * 1000);
        paymentDetails.nextPayment = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        paymentDetails.cardLast4 = (await stripeUtils.getPaymentMethod(SUBSCRIPTION.default_payment_method)).card.last4;
    }

    //  Login user again to update info
    req.login(user, err => {
        if (err) { console.log(err.message); }
    });

    //  Create new session so that user can pay for membership with Stripe Checkout
    const SESSION = {
        membership: await stripeUtils.createMembershipSession(req.user["stripe_id"]),
        edit_card: await stripeUtils.createEditCardSession(req.user["stripe_id"])
    };

    //  Render dashboard ejs with all necessary info
    res.render("dashboard",
        {
            user: user,
            data: data,
            paymentDetails: paymentDetails,
            stripeKey: process.env.STRIPE_KEY,
            customerId: user["stripe_id"],
            sessions: SESSION,
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
        res.redirect("/dashboard");
    }
});

router.get("/stripe/fail", (req, res) => {
    res.render("payment-response", {status:"fail"});
});

//  Cancel stripe subscription route
router.get("/stripe/cancel-membership", async (req, res) => {
    try {
        //  Delete customer's first subscription
        await stripeUtils.deleteStripeSubscription(
            (await stripeUtils.getCustomer(req.user["stripe_id"])).subscriptions.data[0].id
        );

        //  Kick user from discord server
        await botUtils.kickUser(req.user["user_id"]);
    } catch (e) {
        if (e.message.includes("Cannot read property 'id' of undefined")) {
            console.log(`User '${req.user["username"]}' tried to cancel non-existing membership.`);
        } else {
            console.log(e.message);
        }
    }
    res.redirect("/dashboard");
});

router.get("/stripe/change-payment", async (req,res) => {
    res.send(req.url);
});

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

//  Webhook route for stripe events
router.post("/webhook", bodyParser.raw({type: 'application/json'}), async (req, res) => {
    try {
        const STRIPE_SIG = req.headers['stripe-signature'];

        //  Create webhook event object
        let event;
        try {
            event = await stripeUtils.createWebhook(req.body, STRIPE_SIG);
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        //  Switch for different webhook events
        if (event.type === 'checkout.session.completed') {
            //  Get user info and update 'has_membership' data value to true
            const SESSION = event.data.object;
            const USER = await dbUtils.getData("stripe_id", SESSION["customer"]);
            await utils.getFromDataAndUpdate(USER["user_id"], {"has_membership":true});
            const CUSTOMER = await stripeUtils.getCustomer(SESSION["customer"]);

            //  Update customer's and customer subscription's
            //  default payment with last payment's card details
            await stripeUtils.updateStripeCustomer(SESSION["customer"],
                {
                    invoice_settings:
                        {
                            default_payment_method: CUSTOMER.subscriptions.data
                                [
                                    CUSTOMER.subscriptions.data.length - 1
                                ].default_payment_method
                        },
                });
            await stripeUtils.updateStripeSubscription(SESSION["subscription"],
                {
                    default_payment_method: CUSTOMER.subscriptions.data
                        [
                            CUSTOMER.subscriptions.data.length - 1
                        ].default_payment_method
                });
            console.log(`User '${USER["username"]}' has bought a subscription!`);
        }
        await res.json({received: true});
    } catch (e) {
        console.log(e.message);
        return false;
    }
});


module.exports = router;