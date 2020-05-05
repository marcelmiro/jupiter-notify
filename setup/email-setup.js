require("dotenv").config();
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.EMAIL_API);

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
        if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            console.error("sendEmail(): To email doesn't exist.");
            return false;
        }

        let msg = {
            to: to,
            from: { name: from ? from : "Jupiter Notify", email: process.env.EMAIL_ADDRESS },
            subject: subject || "Jupiter Notify"
        };

        if (mode === "all") {
            msg.html = text[0];
            msg.text = text[1];
        } else if (mode === "html") {
            msg.html = text;
        } else {
            msg.text = text;
        }

        return await sgMail.send(msg);
    } catch (e) {
        console.error(`sendEmail(): ${e}`);
        return false;
    }
};

module.exports = { sendEmail };