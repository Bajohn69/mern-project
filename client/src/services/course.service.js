import axios from "axios";
const API_URL = "http://localhost:8080/api/courses";

class CourseService {
  // instructor 新增課程
  post(title, description, price) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.post(
      API_URL,
      { title, description, price },
      {
        headers: {
          Authorization: token, // JWT
        },
      }
    );
  }

  // 使用 student ID 來找到學生註冊的課程
  getEnrolledCourses(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.get(API_URL + "/student/" + _id, {
      headers: {
        Authorization: token,
      },
    });
  }

  // 使用 instructor ID 來找到講師擁有的課程
  get(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.get(API_URL + "/instructor/" + _id, {
      headers: { Authorization: token },
    });
  }

  // 使用課程名稱找到課程
  getCourseByName(name) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.get(API_URL + "/findByName/" + name, {
      headers: {
        Authorization: token,
      },
    });
  }

  // 讓學生透過課程 id 來註冊新課程
  enroll(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    // axios.post 第一個 {} 是要傳送的 data
    return axios
      .post(
        API_URL + "/enroll/" + _id,
        {},
        { headers: { Authorization: token } }
      )
      .then(() => {})
      .catch((e) => {
        console.log(e);
      });
  }
}

export default new CourseService();
