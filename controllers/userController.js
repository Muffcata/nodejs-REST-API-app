const Joi = require("joi").extend(require("joi-phone-number"));
const User = require("../service/models/users");
const jwt = require("jsonwebtoken");
const service = require("../service/index");
const gravatar = require("gravatar");

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
  const avatarURL = gravatar.url(email, { s: "200", d: "retro" });

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
    const newUser = new User({ email, avatarURL });
    newUser.setPassword(password);
    await newUser.save();

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
    const user = req.user;
    const { email, subscription } = user;
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
      } else {
        res.status(200).json({
          status: "success",
          code: 200,
          message: "OK",
          data: {
            avatarURL,
          },
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
};

const avatar = async (res, req, next) => {
  try {
    const { email } = req.user;
    const user = await service.updateAvatar(email, req.body);
    if (user) {
      res.status(200).json({
        status: "success",
        code: 200,
        message: "OK",
        data: {
          user,
        },
      });
    } else {
      res.status(401).json({
        status: "error",
        code: 401,
        message: "Not authorized",
        data: "Not Found",
      });
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
  avatar,
};
