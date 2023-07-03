const sgMail = require("@sendgrid/mail");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = (email, verificationToken) => {
  return {
    to: `${email}`,
    from: "mdabrowskadev@gmail.com",
    subject: "Verify your email",
    text: "Click the link to verify your email",
    html: `<h1>Verification</h1>
    <p>Click on the link below to verify your account</p>
    <a href='http://localhost:3000/api/users/verify/${verificationToken}' target='_blank'>VERIFY</a>
    `,
  };
};

const sendMail = (email, verificationToken) => {
  sgMail
    .send(msg(email, verificationToken))
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = { sendMail };
