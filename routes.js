require("dotenv").config();
const router = require("express").Router();
const passport = require("passport");
const bodyParser = require('body-parser');
const { uuid } = require('uuidv4');
const utils = require("./utils/utils");
const dbUtils = require("./utils/db-utils");
const stripeUtils = require("./utils/stripe-utils");


const authLoginCheck = (req, res, next) => {
    req.user ? res.redirect("/dashboard") : next();
};
const authDashboardCheck = (req, res, next) => {
    req.user ? next() : res.redirect("/");
};

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/auth", authLoginCheck, passport.authenticate(
    "discord",
    { scope: "email"}
));

router.get("/auth/redirect", passport.authenticate(
    "discord",
    { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/dashboard");
    });

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

router.get("/dashboard", authDashboardCheck, async (req, res) => {
    let user = await dbUtils.getData("user_id", req.user["user_id"]);
    let data = JSON.parse(decodeURI(user.data));
    let stripe_customer = await stripeUtils.getCustomer(req.user["stripe_id"]);

    data.has_membership = stripe_customer.subscriptions.data.length > 0;
    await utils.getFromDataAndUpdate(req.user["user_id"], data);
    user.data = data;

    let paymentDetails = {
        interval: undefined,
        price: undefined,
        nextPayment: undefined,
        cardLast4: undefined,
    };
    if (data.has_membership) {
        const SUBSCRIPTION = stripe_customer.subscriptions.data[stripe_customer.subscriptions.data.length - 1];

        if (SUBSCRIPTION.plan.interval === "month") {
            paymentDetails.interval = "Monthly";
        } else {
            paymentDetails.interval = SUBSCRIPTION.plan.interval;
        }
        paymentDetails.price = "$" + (Math.round(SUBSCRIPTION.plan.amount) / 100).toFixed(2);
        let date = new Date(SUBSCRIPTION.current_period_end * 1000);
        paymentDetails.nextPayment = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        paymentDetails.cardLast4 = (await stripeUtils.getPaymentMethod(SUBSCRIPTION.default_payment_method)).card.last4;
    }

    req.login(user, err => {
        if (err) { console.log(err.message); }
    });

    const SESSION = await stripeUtils.createSession(req.user["stripe_id"]);
    res.render("dashboard",
        {
            user: user,
            data: data,
            paymentDetails: paymentDetails,
            stripeKey: process.env.STRIPE_KEY,
            customerId: user["stripe_id"],
            checkoutId: SESSION.id
        });
});

router.get("/stripe/success", (req, res) => {
    let filters = req.url.substring(req.url.indexOf("/success?") + "/success?".length).split("&");
    let filter_dict = {};

    for (let filter of filters) {
        filter_dict[filter.substring(0, filter.indexOf("="))] = filter.substring(filter.indexOf("=") + 1);
    }

    if (filter_dict["session_id"] && filter_dict["customer_id"]) {
        res.render("payment-response", {status:"success"});
    } else {
        let date = new Date();
        let time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        console.log(time + ": /success route problem.");
    }
});

router.get("/stripe/fail", (req, res) => {
    res.render("payment-response", {status:"fail"});
});

router.get("/stripe/cancel-membership", async (req, res) => {
    try {
        await stripeUtils.deleteStripeSubscription(
            (await stripeUtils.getCustomer(req.user["stripe_id"])).subscriptions.data[0].id
        );
    } catch (e) {
        if (e.message.includes("Cannot read property 'id' of undefined")) {
            console.log(`User '${req.user["username"]}' tried to cancel non-existing membership.`);
        } else {
            console.log(e.message);
        }
    }
    res.redirect("/dashboard");
});

router.post("/webhook", bodyParser.raw({type: 'application/json'}), async (req, res) => {
    try {
        const STRIPE_SIG = req.headers['stripe-signature'];

        let event;
        try {
            event = await stripeUtils.createWebhook(req.body, STRIPE_SIG);
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const SESSION = event.data.object;
            const USER = await dbUtils.getData("stripe_id", SESSION["customer"]);
            await utils.getFromDataAndUpdate(USER["user_id"], {"has_membership":true});
            const CUSTOMER = await stripeUtils.getCustomer(SESSION["customer"]);

            console.log(`User '${USER.username}' has subscribed.`);

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
        }

        await res.json({received: true});
    } catch (e) {
        console.log(e.message);
        return false;
    }
});


module.exports = router;
