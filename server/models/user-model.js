const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  role: {
    type: String,
    enum: ["student", "instructor"],
    required: true,
  },
  data: {
    type: Date,
    default: Date.now,
  },
});

// assign a function to the "methods" object of userSchema
// instance methods
userSchema.methods.isStudent = function () {
  return this.role == "student";
};

userSchema.methods.isInstructor = function () {
  return this.role == "instructor";
};

userSchema.methods.comparePassword = async function (password, cb) {
  try {
    let result = await bcrypt.compare(password, this.password); //  有錯會進入 catch
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
  // cb = callback
};

// mongoose middleware
// 若使用者為新用戶，或者是正在更改密碼，則將密碼進行雜湊處理
userSchema.pre("save", async function (next) {
  // 用 arrow function 會抓不到 this 是誰
  // this 代表 mongoDB 的 document
  if (this.isNew || this.Modified("passwors")) {
    // 將密碼進行雜湊處理
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
