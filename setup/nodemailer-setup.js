require("dotenv").config();
const nodemailer = require("nodemailer");

//  Set up SMTP email account
const TRANSPORTER = nodemailer.createTransport({
    /*service: "gmail",
    secure: true,*/
    /*host: "smtp.office365.com", // hostname
    secure: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
        ciphers:'SSLv3'
    },
    requireTLS: true,*/
    service: "hotmail",
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * @param from: sender name (not email)
 * @param to: email address to send email to
 * @param subject: email's subject
 * @param mode: text mode (html or plain text or both)
 * @param text: email's text
 * @returns email's response object or false
 */
let sendEmail = async ({ from: from, to: to, subject: subject, mode: mode, text: text }) => {
    try {
        //  Param validation.
        const PARAMS = [to, mode, text];
        if (PARAMS.filter(n => {return n}).length < PARAMS.length) {
            console.error("sendEmail(): At least 1 input parameter is undefined.");
            return false;
        }

        let data = {
            to: to,
            from: from ? `"${from}" <${process.env.EMAIL_ADDRESS}>` : process.env.EMAIL_ADDRESS,
            subject: subject || "Email from Jupiter Notify"
        };

        if (mode === "all") {
            data.html = text[0];
            data.text = text[1];
        } else if (mode === "html") {
            data.html = text;
        } else {
            data.text = text;
        }

        return await new Promise(async (resolve, reject) => {
            await TRANSPORTER.sendMail(data, (err, reply) => {
                if (err) { console.log("Error in sendEmail():", err.message); reject(err); }
                else { resolve(reply); }
            });
        });
    } catch (e) {
        console.error(`sendEmail(): ${e.message}`);
        return false;
    }
};

module.exports = { sendEmail };