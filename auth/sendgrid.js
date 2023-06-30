const sgMail = require("@sendgrid/mail");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = (email, verificationToken) => {
  return {
    to: email,
    from: "mdabrowskadev@gmail.com",
    subject: "Verify your email",
    text: "Click the link to verify your email",
    html: `<a href='http://localhost:3000/api/users/verify/${verificationToken}'>Click to verify</a>`,
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
