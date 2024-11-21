const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const ejs = require("ejs");
const path = require("path");

dotenv.config();

const smtpOptions = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};

async function sendEmail({
  to,
  subject,
  template,
  from = String(process.env.MAIL_EMAIL),
  data,
}) {
  const transporter = nodemailer.createTransport(smtpOptions);
  const html = await ejs.renderFile(
    path.join(__dirname, `../templates/${template}`),
    data
  );
  await transporter.sendMail({ from, to, subject, html });
}

module.exports = sendEmail;
