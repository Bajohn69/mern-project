const { course } = require("../models");

const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("course route 正在接受一個 request");
  next();
});

// 獲得系統中所有課程
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["username", "email"])
      // .populate()(mongoose 的功能) 根據 courseFound 找到的課程把 ID 轉換成人名
      //  .populate() is query object(thenable object)
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 用講師 id 尋找課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  let coursesFound = await Course.find({ instructor: _instructor_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

// 用學生 id 來尋找註冊過的課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let coursesFound = await Course.find({ students: _student_id }) //  students 是 models 的
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

// 用課程名稱尋找課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let coursesFound = await Course.find({ title: name })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 用課程 id 尋找課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 新增課程
router.post("/", async (req, res) => {
  // 驗證數據符合規範
  let { error } = courseValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  if (req.user.isStudent()) {
    return res
      .status(400)
      .send("只有講師能發布新課程，若你已是講師，請透過講師帳號登入");
  }

  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    let savedCourse = await newCourse.save();
    return res.send(
      "課程創建成功"
      //   savedCourse,
    );
  } catch (e) {
    return res.status(500).send("無法創建課程");
  }
});

// 讓學生透過課程 id 來註冊新課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id }).exec();
    course.students.push(req.user._id);
    await course.save();
    return res.send("課程註冊成功");
  } catch (e) {
    return res.send(e);
  }
});

// 更改課程
router.patch("/:_id", async (req, res) => {
  // 驗證數據符合規範
  let { error } = courseValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // 確認課程存在
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      return res.status(400).send("找不到課程，無法更新課程內容");
    }

    // 使用者必須是此課程的講師，才能編輯
    if (courseFound.instructor.equals(req.user._id)) {
      let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidator: true,
      });
      return res.send({
        message: "課程已更新成功",
        updatedCourse,
      });
    } else {
      return res.status(403).send("必須是此課程的講師，才能編輯");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 刪除課程
router.delete("/:_id", async (req, res) => {
  // 確認課程存在
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id }).exec();
    if (!courseFound) {
      return res.status(400).send("找不到課程，無法刪除課程內容");
    }

    // 使用者必須是此課程的講師，才能刪除
    if (courseFound.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id }).exec();
      return res.send("課程已被刪除");
    } else {
      return res.status(403).send("必須是此課程的講師，才能刪除");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
