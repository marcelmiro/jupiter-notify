require("dotenv").config();
const passport = require("passport");
const DiscordStrategy = require("passport-discord");
const utils = require("../utils/utils");
const dbUtils = require("../utils/db-utils");


passport.serializeUser((user, done) => {
    done(null, user.cookie_id);
});

passport.deserializeUser((id, done) => {
   dbUtils.getData("users", "cookie_id", id).then(user => {
       done(null, user);
   });
});

passport.use(new DiscordStrategy(
    {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: `${process.env.URL}/auth/redirect`
    },
    /**
     * Callback function
     * @param accessToken - String
     * @param refreshToken - String
     * @param profile - profile{id:String, username:String, avatar:String, discriminator:String, email:String,
     *                  locale:String, mfa_enabled:Boolean, flags:Integer, provider:String, accessToken:String,
     *                  fetchedAt:Date}
     * @param done
     */
    (accessToken, refreshToken, profile, done) => {
        const { id, username, discriminator, email, avatar } = profile;
        const AVATAR_URL = avatar ?
            `https://cdn.discordapp.com/avatars/${id}/${avatar}?size=2048` :
            "https://cdn.discordapp.com/embed/avatars/1.png?size=2048";

        utils.userLogin(id, username + "#" + discriminator, email, AVATAR_URL).then(user => {
            done(null, user);
        });
    },
));