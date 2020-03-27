require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();


//  Create guild var to set is when Discord bot is ready.
let guild;
client.on("ready",_ => {
    guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    console.log(`Bot logged in as ${client.user.tag}!`);
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
            console.log(`Created invite: ${INVITE.code}`);
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
            //  Kick and return user object.
            await USER.kick();
            console.log(`User '${USER.user.username}#${USER.user.discriminator}' kicked successfully.`);
            return USER;
        } else {
            console.log("User not found in server.");
            return false;
        }
    } catch (e) {
        console.log("Error in kickUser():", e.message);
        return false;
    }
};

// TODO Remove user from Jupiter Notify's servers when cancel membership

client.login(process.env.DISCORD_BOT_TOKEN);
module.exports = { getUser, inviteUser, kickUser };