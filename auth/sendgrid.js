const sgMail = require("@sendgrid/mail");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = (email, verificationToken) => {
  return {
    to: `${email}`,
    from: "mdabrowskadev@gmail.com",
    subject: "Verify your email",
    text: "Click the link to verify your email",
    html: ` <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 300px; background-color: #777777; font-family: sans-serif; font-size: 1.5rem; border: 1px solid #777777; border-radius: 10px;">
    <h1>Verification</h1>
    <p>Click on the link below to verify your account</p>
    <a href='http://localhost:3000/api/users/verify/${verificationToken}' target='_blank'>VERIFY</a>
    </div>`,
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
