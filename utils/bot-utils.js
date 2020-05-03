require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const nodemailerSetup = require("../setup/nodemailer-setup");


//  Create guild var to set is when Discord bot is ready.
let guild;
client.on("ready",() => {
    guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    console.log(`Bot logged in as ${client.user.tag}.`);
});

//  Returns user if in guild, else returns null.
let getUser = async userId => {
    try {
        const MEMBER = guild.member(userId);
        return MEMBER ? MEMBER : undefined;
    } catch (e) {
        console.error(`getUser(): ${e.message}`);
        return undefined;
    }
};

//  Invite user to Discord server.
let inviteUser = async userId => {
    try {
        //  Validate 'userId'.
        if (!userId || isNaN(parseInt(userId))) return;

        //  Checks if user is not in guild, else can't invite as already in server.
        const USER = await getUser(userId);
        if (USER) {
            console.log(`User '${USER.user.username}#${USER.user.discriminator}' already in server.`);
            return false;
        } else {
            //  Get server's default channel (#general) id, and invites user to channel.
            //  Invite is 1 time use and unique. Returns discord invite url.
            const CHANNEL_ID = guild.channels.cache.first().guild.systemChannelID;
            const INVITE = await client.channels.cache.get(CHANNEL_ID).createInvite({
                maxUses: 1,
                unique: true,
            });

            console.log(`Created invite: ${INVITE.code}`);
            return "https://discord.gg/" + INVITE;
        }
    } catch (e) {
        console.error(`inviteUser(): ${e.message}`);
        return false;
    }
};

//  Kick user from Discord server.
let kickUser = async (userId, email) => {
    try {
        //  Checks if user is in guild, else can't kick him.
        const USER = await getUser(userId);
        if (USER) {
            //  Send direct message to user to let them know they have been kicked from server.
            await USER.send(new Discord.MessageEmbed()
                .setColor(16741888)
                .setTitle(
                    "You have been kicked from Jupiter Notify 😔"
                )
                .setDescription(
                    "We're sorry that you're leaving. " +
                    "If you need help, please contact a member of staff or email us at `support@jupiternotify.com`."
                )
                .setFooter(
                    "Hope to see you soon!",
                    "https://cdn.discordapp.com/icons/671296843493146626/a_f0530061e23de30a6a1816f4a0a9ef5d.png?size=2048"
                ));

            //  Kick user from server.
            await USER.kick();
            console.log(`User '${USER.user.username}#${USER.user.discriminator}' was kicked successfully from server.`);
        } else {
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                console.error("kickUser(): Email doesn't exist.");
                return false;
            }

            const DATA = {
                from: "Jupiter Notify",
                to: email,
                subject: "You have been kicked from Jupiter Notify",
                mode: "all",
                text: [
                    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Jupiter Notify</title><style>html, body{margin: 0; padding: 0; width: 100%; font-family: Roboto, sans-serif;}.banner{display: flex; flex-flow: row nowrap; justify-content: space-around; align-items: center;}h1{font-size: 54px;}h1 span{font-weight: 200; margin-left: 6px;}img{width: 25%; max-width: 220px;}.text-container{width: 90%; margin: 0 auto;}h3{font-size: 21px;}p{font-size: 16px;}@media screen and (max-width: 600px){h1{font-size: 42px;}.text-container{width: 94%;}h3{font-size: 18px;}p{font-size: 15px;}}@media screen and (max-width: 500px){h3{margin: 26px 0;}}@media screen and (max-width: 400px){h1{font-size: 38px;}}</style></head><body><div style="width: 100%; max-width: 900px; margin: 0 auto;"><div class="banner"><h1>Jupiter<span>Notify</span></h1><img src="https://cdn.discordapp.com/avatars/686627755336663070/74da80a4836531d898b122214ebbf065.png?size=2048" alt="Jupiter Logo"/></div><div class="text-container"><h3>You have been kicked from Jupiter Notify.</h3><p>Either you cancelled your Jupiter Notify membership, or payment was declined. If you need help, please contact a member of staff or email us at <a href="mailto: support@jupiternotify.com">support@jupiternotify.com</a>.</p></div></div></body></html>`,
                    `Jupiter Notify\n\nYou have been kicked from Jupiter Notify.\nEither you cancelled your Jupiter Notify membership, or payment was declined. If you need help, please contact a member of staff or email us at support@jupiternotify.com.`
                ]
            };

            if (await nodemailerSetup.sendEmail(DATA)) {
                console.log(`Couldn't kick user from server. Email sent to '${email}'`);
            } else {
                return false;
            }
        }
        return true;
    } catch (e) {
        console.error(`kickUser(): ${e.message}`);
        return false;
    }
};

client.login(process.env.DISCORD_BOT_TOKEN);
module.exports = { getUser, inviteUser, kickUser };