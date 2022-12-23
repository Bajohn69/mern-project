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
// --------- heroku 新增-----------------
const path = require("path");
const port = process.env.PORT || 8080;
// process.env.PORT 是 heroku 自動動態設定的
// --------- heroku 新增-----------------

mongoose
  .connect(process.env.MONGODB_CONNECTION)
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
// --------- heroku 新增-----------------
app.use(express.static(path.join(__dirname, "client", "build")));
// --------- heroku 新增-----------------

app.use("/api/user", authRoute);
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }), // 用 passport.authenticate 保護 /courses
  courseRoute
);
// 要被 jwt 保護，只有登入系統的人，才能新增或註冊課程(驗證 jwt)
// 如果 request header 內部沒有 jwt 則 request 會被視為是 unauthorized

// --------- heroku 新增-----------------
// 只要網頁放到雲端的伺服器時，若有接收到除了上方兩個之外的 request 就會到下面把 index.html 送給使用者
// heroku 自動設定的環境變數 NODE_ENV
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}
// --------- heroku 新增-----------------

// react default is port 3000 要錯開
app.listen(port, () => {
  console.log("Server is running on port 8080.");
});
