const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  console.log("正在接收一個跟 auth 有關的請求");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("成功連結 auth route");
});

router.post("/register", async (req, res) => {
  // 確認數據是否符合規範
  // console.log(registerValidation(req.body)); // 有錯就會告訴你
  let { error } = registerValidation(req.body);
  // console.log(error); // message: '"role" must be one of [student, instructor]',
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  // return res.send("註冊使用者");

  // 確認信箱是否被註冊過
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(400).send("此信箱已被註冊過");
  }

  // 製作新用戶
  let { username, email, password, role } = req.body;
  let newUser = new User({ username, email, password, role });
  try {
    let savedUser = await newUser.save();
    return res.send({
      msg: "使用者成功儲存",
      savedUser,
    });
  } catch (e) {
    return res.status(500).send("無法儲存使用者");
  }
});

router.post("/login", async (req, res) => {
  // 確認數據是否符合規範
  let { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // 確認信箱是否存在
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res.status(401).send("無此用戶，請確認信箱是否正確");
  }

  // 比對密碼(傳進 user-model 的 instance method)
  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (isMatch) {
      // 製作 json web token
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        message: "登入成功",
        token: "JWT " + token, // JWT 一定要加空格
        user: foundUser,
      });
    } else {
      return res.status(401).send("密碼錯誤");
    }
  });
});

module.exports = router;
