const passport = require("passport");
const passportJWT = require("passport-jwt");
const User = require("./../service/models/users");

require("dotenv").config();
const jwtSecretKey = process.env.JWT_SECRET_KEY;

const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;

const params = {
  secretOrKey: jwtSecretKey,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(params, function (payload, done) {
    User.find({ _id: payload.id })
      .then(([user]) => {
        if (!user) {
          return done(new Error("User is not here"));
        }
        return done(null, user);
      })
      .catch((err) => done(err));
  })
);
