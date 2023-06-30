const Joi = require("joi").extend(require("joi-phone-number"));
const User = require("../service/models/users");
const jwt = require("jsonwebtoken");
const service = require("../service/index");
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");
const { sendMail } = require("../auth/sendgrid");

require("dotenv").config();
const jwtSecretKey = process.env.JWT_SECRET_KEY;

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: false });

const userCreateValidationShema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  subscription: Joi.string().valid("starter", "pro", "business"),
});

const validateCreateUser = validator(userCreateValidationShema);

const subscriptionUpdate = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

const validateSubscription = validator(subscriptionUpdate);

const register = async (req, res, next) => {
  const { email, password } = req.body;
  const verificationToken = nanoid();
  const user = await User.findOne({ email });
  if (user) {
    res.json({
      status: "error",
      code: 409,
      data: "Conflict",
      message: "User already exist",
    });
  }
  try {
    const { error } = validateCreateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const newUser = new User({ email, verificationToken });
    newUser.setPassword(password);
    newUser.avatarURL = gravatar.url(email, { s: "200", d: "retro" });
    await newUser.save();
    sendMail(email, verificationToken);

    res.json({
      status: "success",
      code: 201,
      user: {
        email: email,
        subscription: "starter",
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const { error } = validateCreateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  const user = await User.findOne({ email });
  if (!user || !user.validPassword(password)) {
    return res.json({
      status: "error",
      code: 400,
      data: "Bad request",
      message: "Incorrect login/password",
    });
  }
  const payload = {
    id: user.id,
  };
  const token = jwt.sign(payload, jwtSecretKey, { expiresIn: "1h" });
  user.token = token;
  await user.save();

  res.json({
    status: "success",
    code: 200,
    token: token,
    data: {
      email: email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res, next) => {
  try {
    req.user.token = null;
    await req.user.save();
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};

const currentUser = async (req, res, next) => {
  try {
    const { email } = req.user;

    res.json({
      status: "OK",
      code: 200,
      ResponseBody: {
        email: email,
        subscription: subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const subscription = async (req, res, next) => {
  const { subscription, email } = req.body;

  const { error } = validateSubscription({ subscription, email });
  if (error) {
    try {
      const user = await service.updateSubscription(email, subscription);
      if (user) {
        res.status(200).json({
          status: "success",
          code: 200,
          data: {
            email,
            subscription,
          },
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
};
const updateAvatar = async (email, avatarURL) => {
  const user = await User.findOneAndUpdate(
    { email },
    { avatarURL },
    { new: true }
  );
  return user;
};

const verifyToken = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await service.verifyUser(verificationToken);
    if (user) {
      return res.status(200).json({ message: "Verification successful" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    next(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const sendMailAgain = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await service.getUser(email);
    if (!user.isVerified) {
      sendMail(email, user.verificationToken);
      res.status(200).json({ message: "Verification email sent" });
    } else {
      res.status(400).json({ message: "Verification has already been passed" });
    }
  } catch (error) {
    next(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  login,
  register,
  logout,
  currentUser,
  subscription,
  updateAvatar,
  verifyToken,
  sendMailAgain,
};
