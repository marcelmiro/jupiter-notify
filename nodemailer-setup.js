require("dotenv").config();
const nodemailer = require("nodemailer");

//  Set up SMTP email account
const TRANSPORTER = nodemailer.createTransport({
    host: process.env.EMAIL_HOSTNAME,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 *
 * @param to: email address to send email to
 * @param subject: email's subject
 * @param type: text type (html or plain text)
 * @param text: email's text
 * @returns email's response or error object
 */
let sendEmail = async (to, subject, type, text) => {
    return await new Promise(async (resolve, reject) => {
        const DATA = {
            to: to,
            subject: subject,
        };
        if (type === "all") {
            DATA.html = text[0];
            DATA.text = text[1];
        } else if (type === "html") {
            DATA.html = text;
        } else {
            DATA.text = text;
        }
        type === "html" ? DATA.html = text : DATA.text = text;

        await TRANSPORTER.sendMail(DATA, (err, reply) => {
            if (err) { console.log("Error in sendEmail():", err.message); reject(err); }
            else { resolve(reply); }
        });
    });
};

module.exports = {sendEmail};