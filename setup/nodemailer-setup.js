require("dotenv").config();
const nodemailer = require("nodemailer");
const dbUtils = require("../utils/db-utils");

//  Set up SMTP email account
const TRANSPORTER = nodemailer.createTransport({
    host: process.env.EMAIL_HOSTNAME,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 *
 * @param to: email address to send email to
 * @param subject: email's subject
 * @param mode: text mode (html or plain text or both)
 * @param text: email's text
 * @returns email's response or error object
 */
let sendEmail = async (to, subject, mode, text) => {
    try {
        return await new Promise(async (resolve, reject) => {
            const DATA = {
                to: to,
                subject: subject,
            };
            if (mode === "all") {
                DATA.html = text[0];
                DATA.text = text[1];
            } else if (mode === "html") {
                DATA.html = text;
            } else {
                DATA.text = text;
            }

            await TRANSPORTER.sendMail(DATA, (err, reply) => {
                if (err) { console.log("Error in sendEmail():", err.message); reject(err); }
                else { resolve(reply); }
            });
        });
    } catch (e) {
        console.error(`sendEmail(): ${e.message}`);
    }
};

module.exports = {sendEmail};