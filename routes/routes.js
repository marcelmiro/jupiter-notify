require("dotenv").config();
const router = require("express").Router();
const bodyParser = require('body-parser');
const authRoutes = require("./auth-routes");
const stripeRoutes = require("./stripe-routes");
const utils = require("../utils/utils");
const dbUtils = require("../utils/db-utils");
const stripeUtils = require("../utils/stripe-utils");
const botUtils = require("../utils/bot-utils");
const nodemailerSetup = require("../setup/nodemailer-setup");

//  Component routes
router.use("/auth", authRoutes);
router.use("/stripe", stripeRoutes);

//  Checks if cookie has user object to keep dashboard page, if not, go back to home page.
const authDashboardCheck = (req, res, next) => {
    req.user ? next() : res.redirect("/");
};

router.get("/", async (req, res) => {
    try {
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
    } catch (e) {
        console.log("Error in '/' route:", e.message);
    }
});

router.get("/dashboard", authDashboardCheck, async (req, res) => {
    try {
        // TODO Check if user is a stripe customer (Special case)
        // FIXME user.stripe_id contains deleted customer and not new customer id,
        //  therefore error "Cannot read property 'data' of undefined.
        //  I think it's because stripe_id was updated in either localhost or heroku db but not in the other db.

        //  Get stripe customer object and check if customer has membership active.
        const CUSTOMER = await stripeUtils.getCustomer(req.user["stripe_id"]);
        const HAS_MEMBERSHIP = Boolean(CUSTOMER.subscriptions.data.length > 0);

        //  Get user's role and modify object to get only necessary data.
        let role = await dbUtils.getRole(req.user["user_id"]);

        //  Return to home page if user doesn't have a membership, or doesn't have a role or is a 'renewal' member.
        if (!role) {
            if (HAS_MEMBERSHIP) {
                const ROLE_ID = (await dbUtils.getData("roles", "name", "renewal"))["role_id"];
                await dbUtils.insertData("user_roles", [req.user["user_id"], ROLE_ID]);
            } else {
                return res.redirect("/");
            }
        }
        if (!HAS_MEMBERSHIP && role.name === "renewal") {
            await dbUtils.deleteData("user_roles", "user_id", req.user["user_id"]);
            return res.redirect("/");
        }

        //  Set role, membership and payment details object.
        role = {name: role.name, admin_panel: role["perms"]["admin_panel"]};
        let membershipDetails = {
            isCancelled: false,
            interval: "null",
            price: "null",
            dateNextPayment: "null",
            dateCreated: "null",
        };
        //  Default as string to show if no default payment found.
        let paymentDetails = {
            name: "null",
            last4: "null",
            dateExpiry: "null",
        };

        //  Get customer's subscription.
        const SUBSCRIPTION = CUSTOMER.subscriptions.data[0];
        let session = undefined;
        if (SUBSCRIPTION) {
            //  Create session to update subscription payment details.
            session = await stripeUtils.createEditCardSession(req.user["stripe_id"], SUBSCRIPTION.id);

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
        } else if (role.name !== "renewal") {
            membershipDetails = {
                interval: role.name,
                price: "Lifetime",
                dateNextPayment: "Never",
                dateCreated: await utils.transformDate(new Date(req.user.data["date_created"])),
            };
        }

        //  Render dashboard ejs with all necessary data.
        res.render("dashboard",
            {
                user: { ...req.user, ...{role: role}},
                stripeKey: process.env.STRIPE_KEY,
                membershipDetails: membershipDetails,
                paymentDetails: paymentDetails,
                session: session,
                userInServer: Boolean(await botUtils.getUser(req.user["user_id"]))
            });
    } catch (e) {
        console.log("Error in '/dashboard' route:", e.message);
        res.redirect("/");
    }
});

//  Testing dashboard design route
router.get("/test", (req,res) => {
    const USER = {
        user_id: "1234567890",
        cookie_id: "1234567890",
        stripe_id: "1234567890",
        username: "JohnDoe#0000",
        email: "john.doe@johndoe.johndoe",
        avatar_url: "https://upload.wikimedia.org/wikipedia/en/e/ee/Unknown-person.gif",
        data: { date_created: 0 },
        role: "renewal"
    };
    const MEMBERSHIP_DETAILS = {
        isCancelled: false,
        interval: "Monthly",
        price: "$20.00",
        dateNextPayment: "28/08/2020",
        dateCreated: "12/02/2019",
    };
    const PAYMENT_DETAILS = {
        name: "John Doe",
        last4: "0000",
        dateExpiry: "00/00",
    };

    res.render("dashboard",
        {
            user: USER,
            stripeKey: "",
            membershipDetails: MEMBERSHIP_DETAILS,
            paymentDetails: PAYMENT_DETAILS,
            session: "123",
            userInServer: false
        });
});

//  Route to invite discord user to server
router.get("/discord/join", async (req,res) => {
    //  Get user's stripe info to check if user has membership active
    const CUSTOMER = await stripeUtils.getCustomer(req.user["stripe_id"]);
    if (CUSTOMER.subscriptions.data.length > 0) {
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
            "text",
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

module.exports = router;