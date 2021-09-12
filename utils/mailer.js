const nodemailer = require("nodemailer");
require("dotenv").config({ path: ".env" });


const transporter = nodemailer.createTransport({
  host: "email-smtp.eu-west-3.amazonaws.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
});


  module.exports = transporter;
  
