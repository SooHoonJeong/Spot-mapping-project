import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const authService = {
  async signup(userData) {
    const response = await API.post("/api/auth/register/general", userData);
    return response.data;
  },

  async login(email, password) {
    const response = await API.post("/api/auth/login", { email, password });

    if (response.data.token) {
      localStorage.setItem("accessToken", response.data.token);
    }

    return response.data;
  },

  logout() {
    localStorage.removeItem("accessToken");
  },
};
