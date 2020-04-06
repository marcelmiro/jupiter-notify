require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();


//  Create guild var to set is when Discord bot is ready.
let guild;
client.on("ready",() => {
    guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    console.log(`Bot logged in as ${client.user.tag}.`);
});

//  Returns user if in guild, else returns null.
let getUser = async userId => {
    return guild.member(userId);
};

//  Invite user to Discord server.
let inviteUser = async userId => {
    try {
        //  Checks if user is not in guild, else can't invite as already in server.
        if (!(await getUser(userId))) {
            //  Get server's default channel (#general) id, and invites user to channel.
            //  Invite is 1 time use and unique. Returns discord invite url.
            const CHANNEL_ID = guild.channels.cache.first().guild.systemChannelID;
            const INVITE = await client.channels.cache.get(CHANNEL_ID).createInvite({
                maxUses: 1,
                unique: true,
            });
            console.log(`Created invite for user '${userId}': ${INVITE.code}`);
            return "https://discord.gg/" + INVITE;
        } else {
            console.log(`User '${userId}' already in server.`);
            return false;
        }
    } catch (e) {
        console.log("Error in inviteUser():", e.message);
        return false;
    }
};

//  Kick user from Discord server.
let kickUser = async userId => {
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
                    "Either you cancelled your Jupiter Notify membership, or payment was declined. " +
                    "If you need help, please contact a member of staff or dm `UNKWN#6666`."
                )
                .setFooter(
                    "Hope to see you soon!",
                    "https://cdn.discordapp.com/icons/671296843493146626/a_f0530061e23de30a6a1816f4a0a9ef5d.png?size=2048"
                ));

            //  Kick user from server.
            await USER.kick();
            console.log(`User '${USER.user.username}#${USER.user.discriminator}' kicked successfully from Discord server.`);

            return USER;
        } else {
            console.log("User was not found in Discord server.");
            return false;
        }
    } catch (e) {
        console.log("Error in kickUser():", e.message);
        return false;
    }
};

client.login(process.env.DISCORD_BOT_TOKEN);
module.exports = { getUser, inviteUser, kickUser };