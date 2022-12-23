const passport = require("passport");

let JwtStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt; // 把 token (3 個 part)拉出來
// https://www.passportjs.org/packages/passport-jwt/
const User = require("../models").user;

module.exports = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.PASSPORT_SECRET;

  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      try {
        let foundUser = await User.findOne({ _id: jwt_payload._id }).exec();
        if (foundUser) {
          return done(null, foundUser); // 把 req.user 設定成 foundUser
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
      //   console.log(jwt_payload);
      /* {
    _id: '63a029f68dd476d2330dd60d',
    email: 'mike1234@gmail.com',
    iat: 1671440908
    }*/
    })
  );
};
