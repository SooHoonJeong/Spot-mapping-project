import API from "../../../api/axios";

export const authService = {
  async getProfile() {
    const response = await API.get("");
    return response.data;
  },

  async signup(userData) {
    const response = await API.post("/auth/register/general", userData);
    return response.data;
  },

  async sendVerificationEmail(email) {
    const response = await API.post("/auth/email/send", { email });
    return response.data;
  },

  async checkVerificationEmail(email, code) {
    const response = await API.post("/auth/email/verify", { email, code });
    return response.data;
  },

  async login(email, password) {
    const response = await API.post("/auth/login", { email, password });

    if (response.data.token) {
      localStorage.setItem("accessToken", response.data.token);
    }

    return response.data;
  },

  logout() {
    localStorage.removeItem("accessToken");
  },
};
