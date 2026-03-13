import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import HomePage from "./features/auth/components/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";
import { useAuthStore } from "./stores/useAuthStore";
import { authService } from "./features/auth/services/authService";
import Navbar from "./features/auth/components/Navbar";

function App() {
  const { setAccessToken, setUser } = useAuthStore();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await API.post("refresh API 주소");
        setAccessToken(response.data.accessToken);

        const userRes = await authService.getProfile();
        setUser(userRes);
      } catch (err) {
        console.log("로그인 상태가 아닙니다.");
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
