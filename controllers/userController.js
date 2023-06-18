const Joi = require("joi").extend(require("joi-phone-number"));
const User = require("../service/models/users");
const jwt = require("jsonwebtoken");

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

const register = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);

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
    const newUser = new User({ email });
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

// const getUser = (req, res, next) => {
//   const { username } = req.user;
//   res.json({
//     status: "success",
//     code: 200,
//     data: {
//       message: `Authorization was successful: ${username}`,
//     },
//   });
// };

module.exports = {
  login,
  register,
};
