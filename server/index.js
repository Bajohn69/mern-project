const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const dotenv = require("dotenv");
const { urlencoded } = require("express");
dotenv.config();
const authRoute = require("./routes").auth; // 得到 router
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
// 這裡面是一個 function 代入 passport 參數直接執行
const cors = require("cors");

mongoose
  .connect("mongodb://localhost:27017/mernDB")
  .then(() => {
    console.log("Connecting to mongoDB");
  })
  .catch((e) => {
    console.log(e);
  });

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", authRoute);
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }), // 用 passport.authenticate 保護 /courses
  courseRoute
);
// 要被 jwt 保護，只有登入系統的人，才能新增或註冊課程(驗證 jwt)
// 如果 request header 內部沒有 jwt 則 request 會被視為是 unauthorized

// react default is port 3000 要錯開
app.listen(8080, () => {
  console.log("Server is running on port 8080.");
});
