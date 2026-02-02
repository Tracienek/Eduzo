const nodemailer = require("nodemailer");

function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}

async function sendMail({ to, subject, text, html }) {
    const transporter = getTransporter();
    if (!transporter) {
        throw new Error("SMTP not configured");
    }

    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    return transporter.sendMail({ from, to, subject, text, html });
}

module.exports = { sendMail };
