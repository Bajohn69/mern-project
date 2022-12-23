// auth.service.js 創造一個服務的物件，扮演一個服務器的腳色，跟登入有關就來找這
import axios from "axios";
const API_URL = "http://localhost:8080/api/user";

class AuthService {
  // methods
  login(email, password) {
    return axios.post(API_URL + "/login", { email, password });
  }
  logout() {
    localStorage.removeItem("user");
  }
  // 註冊需要這四個 username, email, password, role
  // AuthService 執行 register 的話，他會自動幫你 post 到 API_URL/register 代入這四個參數
  // 有註冊成功就會 return Promise
  register(username, email, password, role) {
    return axios.post(API_URL + "/register", {
      username,
      email,
      password,
      role,
    });
    // axios.post 會 return Promise
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

export default new AuthService();
