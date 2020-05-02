require("dotenv").config();
const router = require("express").Router();
const passport = require("passport");
const stripeUtils = require("../utils/stripe-utils");


//  Checks if cookie has user object to redirect to dashboard, instead of having to login again.
const authLoginCheck = (req, res, next) => {
    req.user ? res.redirect("/dashboard") : next();
};

//  Login with Discord route
router.get("/login", authLoginCheck, (req,res) => {
    //  If url contains filter 'pay', set query return value to 'subscription-checkout'.
    req.query.returnTo = undefined;
    if (req.url.includes("?pay")) {
        if (req.url.includes("&currency=")) {
            req.query.returnTo = "subscription-checkout-" + req.url.substr(req.url.indexOf("&currency=") + "&currency=".length);
        } else {
            req.query.returnTo = "subscription-checkout";
        }
    }

    //  If 'returnTo' contains string, encode to base64 to send it as an option to auth.
    const { returnTo } = req.query;
    const STATE = returnTo ? Buffer.from(JSON.stringify({ returnTo })).toString('base64') : undefined;

    //  Authenticate.
    passport.authenticate(
        "discord",
        { scope: ["identify", "email"], state: STATE }
    )(req,res);
});

//  Discord redirect route from login
router.get("/redirect", passport.authenticate("discord", {
    failureRedirect: "/"
}), async (req, res) => {
    //  Checks if user has membership. If true, redirect to dashboard,
    //  else redirect to stripe checkout to pay subscription.
    const CUSTOMER = await stripeUtils.getCustomer(req.user.stripe_id);
    if (CUSTOMER?.subscriptions?.data.length > 0) {
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
                } else if (returnTo.includes("subscription-checkout")) {
                    if (returnTo.includes("subscription-checkout-")) {
                        const CURRENCY = returnTo.substr(returnTo.indexOf("subscription-checkout-") + "subscription-checkout-".length);
                        return res.redirect("/stripe/pay?currency=" + CURRENCY);
                    } else {
                        return res.redirect("/stripe/pay");
                    }
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

//  Logs out user
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

module.exports = router;